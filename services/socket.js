const socketioJwt = require('socketio-jwt')
const {User, Dialog, Message} = require('../model/user')
const time = () => {
    const data = new Date().toLocaleString('ru-RU')
    const data1 = data.split(',')
    return {data: data1[0], time: data1[1].slice(1, 6)}
}

function socketService(io) {
    io.use(
        socketioJwt.authorize({
            secret: 'pasha1neo',
            handshake: true,
            auth_header_required: true,
        })
    )
    io.use(async (socket, next) => {
        try {
            const userId = socket.decoded_token?.userId
            if (userId !== null) {
                const user = await User.findById(userId, 'login nickname onlineStatus')
                if (user !== null) {
                    user.onlineStatus = true
                    await user.save()
                    socket.userId = user._id.toString() // Id возвращаемый из бд не соответствует строке
                    socket.username = user.nickname || user.login
                    next()
                }
            }
        } catch (error) {
            console.log('socket/middleware')
        }
    })

    io.on('connection', async (socket) => {
        socket.on('disconnect', async () => {
            const user = await User.findById(socket.userId)
            user.onlineStatus = false
            user.save()
            socket.broadcast.emit('USER:DISCONNECTED', {
                _id: socket.userId,
                onlineStatus: false,
            })
        })
        socket.join(socket.userId)
        const user = await User.findById(socket.userId, 'login nickname onlineStatus avatar')
        socket.broadcast.emit('USER:CONNECTED', user)
        socket.on('GET:DATA:USERS', async (uploadData) => {
            const users = await User.find({}, 'login nickname onlineStatus avatar')
            uploadData(users)
        })
        socket.on('GET:DATA:DIALOGS', async (uploadData) => {
            try {
                const {dialogs} = await User.findOne({_id: socket.userId}, 'dialogs').populate({
                    path: 'dialogs',
                    populate: {
                        path: 'messages',
                        populate: {path: 'fid', select: 'login nickname avatar'},
                    },
                })
                uploadData(dialogs)
            } catch (error) {
                console.log('socket/GED:DATA:DIALOGS')
            }
        })
        socket.on('SEND:MESSAGE', async ({tid, msg}, res) => {
            try {
                const message = await Message.create({
                    fid: socket.userId,
                    text: msg,
                    read: false,
                    ...time(),
                })
                const user = await User.findOne(
                    {_id: socket.userId},
                    'dialogs nickname login avatar'
                ).populate({
                    path: 'dialogs',
                    select: 'wid',
                    match: {wid: tid},
                })
                const MESSAGE = {
                    ...message._doc,
                    fid: {
                        _id: user._id,
                        nickname: user?.nickname,
                        login: user.login,
                        avatar: user.avatar,
                    },
                }
                if (user.dialogs[0]) {
                    await Dialog.findByIdAndUpdate(user.dialogs[0]._id, {
                        $push: {messages: message._id},
                    })
                    res({
                        message: MESSAGE,
                        dialog: {_id: user.dialogs[0]._id, wid: user.dialogs[0].wid},
                    })
                } else {
                    const dialog = await Dialog.create({wid: tid, messages: [message._id]})
                    user.dialogs.push(dialog._id)
                    await user.save()
                    res({
                        message: MESSAGE,
                        dialog: {_id: dialog._id, wid: dialog.wid},
                    })
                }
                if (tid !== socket.userId) {
                    const user = await User.findOne({_id: tid}, 'dialogs').populate({
                        path: 'dialogs',
                        match: {wid: socket.userId},
                        populate: {path: 'messages'},
                    })
                    if (user.dialogs[0]) {
                        await Dialog.findByIdAndUpdate(user.dialogs[0]._id, {
                            $push: {messages: message._id},
                        })
                        socket.to(tid).emit('NEW:MESSAGE', {
                            message: MESSAGE,
                            dialog: {_id: user.dialogs[0]._id, wid: user.dialogs[0].wid},
                        })
                    } else {
                        const dialog = await Dialog.create({
                            wid: socket.userId,
                            messages: [message._id],
                        })
                        user.dialogs.push(dialog._id)
                        socket.to(tid).emit('NEW:MESSAGE', {
                            message: MESSAGE,
                            dialog: {_id: dialog._id, wid: dialog.wid},
                        })
                    }
                    await user.save()
                }
            } catch (error) {
                console.log('socket/SEND:MESSAGE')
            }
        })
        socket.on('READ:MESSAGE', async ({wid, mid}) => {
            if (wid !== socket.userId) {
                await Message.findByIdAndUpdate(mid, {read: true})
                socket.to(wid).emit('READED:MESSAGE', {wid: socket.userId, mid})
                socket.emit('READED:MESSAGE', {wid, mid})
            }
        }) // обновлять не одно сообщение а массив сообщений с помощью updateMany и циклов
        socket.on('MESSAGE:CHANGE', async ({wid, mid, text}, res) => {
            await Message.findByIdAndUpdate(mid, {text})
            if (wid !== socket.userId) {
                socket.to(wid).emit('MESSAGE:CHANGED', {wid: socket.userId, mid, text})
            }
            res({wid, mid, text})
        })
        socket.on('MESSAGE:DELETE', async ({wid, mid}, res) => {
            const user = await User.findById(socket.userId, 'dialogs').populate({
                path: 'dialogs',
                match: {wid},
                select: 'messages',
                populate: {
                    path: 'messages',
                    match: {_id: mid, fid: socket.userId},
                    select: 'fid',
                },
            })
            const did = user.dialogs[0]?._id
            const my = user.dialogs[0]?.messages[0]
            if (did) {
                const dialog = await Dialog.findById(did)
                const result = dialog.messages.remove(mid)
                if (result) {
                    if (wid !== socket.userId && my) {
                        const toUser = await User.findById(wid, 'dialogs').populate({
                            path: 'dialogs',
                            match: {wid: socket.userId},
                            select: 'messages',
                        })
                        const toDid = toUser.dialogs[0]?._id
                        if (toDid) {
                            const toDialog = await Dialog.findById(toDid)
                            const toResult = toDialog.messages.pull(mid) //--------------
                            if (toResult) {
                                await dialog.save()
                                await toDialog.save()
                                await Message.findByIdAndRemove(mid)
                                res({wid, mid})
                                socket.to(wid).emit('MESSAGE:DELETED', {wid: socket.userId, mid})
                            }
                        }
                    } else if (wid === socket.userId) {
                        await Message.findByIdAndRemove(mid)
                        await dialog.save()
                        res({wid, mid})
                    } else {
                        await dialog.save()
                        res({wid, mid})
                    }
                }
            }
        })
    })
}
module.exports = socketService

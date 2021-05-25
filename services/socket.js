const socketioJwt = require('socketio-jwt')
const {User, Dialog, Message} = require('../model/user')
const Session = require('../model/session')
var fs = require('fs')
var util = require('util')
const mongoose = require('mongoose')
const time = (() => {
    const data = new Date().toLocaleString('ru-RU')
    const data1 = data.split(',')
    return {data: data1[0], time: data1[1].slice(1, 6)}
})()

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

    io.on('connection', (socket) => {
        socket.on('disconnect', async () => {
            const user = await User.findById(socket.userId)
            user.onlineStatus = false
            user.save()
            socket.broadcast.emit('USER:DISCONNECTED', {
                userId: socket.userId,
                onlineStatus: false,
            })
        })
        socket.join(socket.userId)
        socket.broadcast.emit('USER:CONNECTED', {
            userId: socket.userId,
            onlineStatus: true,
        })
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
                    ...time,
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
                console.log(error)
                console.log('socket/SEND:MESSAGE')
            }
        })
    })
}
module.exports = socketService

// function nonstart(io) {
//     io.use((socket, next) => {
//         const sessionID = socket.handshake.auth.sessionID
//         if (sessionID) {
//             const session = sessionStore.findSession(sessionID)
//             if (session) {
//                 socket.sessionID = sessionID
//                 socket.userID = session.userID
//                 socket.username = session.username
//                 return next()
//             }
//         }
//         const username = socket.handshake.auth.username
//         if (!username) {
//             return next(new Error('invalid username'))
//         }
//         socket.sessionID = randomId()
//         socket.userID = randomId()
//         socket.username = username
//         next()
//     })

//     io.on('connection', (socket) => {
//         // console.log(socket.decoded_token)
//         // sessionStore.saveSession(socket.sessionID, {
//         //     userID: socket.userID,
//         //     username: socket.username,
//         //     connected: true,
//         // })

//         // socket.emit('session', {
//         //     sessionID: socket.sessionID,
//         //     userID: socket.userID,
//         // })

//         // socket.join(socket.userID)
//         // sessionStore.findAllSessions().forEach((session) => {
//         //     db.user(session.userID, session.username, session.connected)
//         // })
//         // db.connect(socket.userID, true)

//         // socket.on('GET:USERS', (cb) => {
//         //     cb(db.getUsersData())
//         // })
//         // socket.broadcast.emit('USER:CONNECTED', {
//         //     userID: socket.userID,
//         //     username: socket.username,
//         //     connected: true,
//         // })
//         // socket.on('GET:MESSAGESDATA', (dataUpload) => {
//         //     dataUpload(db.getDialogs(socket.userID))
//         // })
//         socket.on('SEND:MESSAGE', ({tid, msg}) => {
//             const message = db.message(socket.userID, tid, msg)
//             if (socket.userID === tid) {
//                 socket.emit('NEW:MESSAGE', {wid: socket.userID, message})
//             } else if (tid === 'chat') {
//                 io.emit('NEW:MESSAGE', {wid: tid, message})
//             } else {
//                 socket.to(tid).emit('NEW:MESSAGE', {wid: socket.userID, message})
//                 socket.emit('NEW:MESSAGE', {wid: tid, message})
//             }
//         })
//         socket.on('MESSAGE:CHANGE', (wid, mid, message) => {
//             if (wid === 'chat') {
//                 db.setMessageTextInGlobalChat(mid, message)
//                 io.emit('MESSAGE:CHANGED', {wid, mid, message})
//             } else if (wid === socket.userID) {
//                 db.setMessageText(socket.userID, wid, mid, message)
//                 socket.emit('MESSAGE:CHANGED', {wid, mid, message})
//             } else {
//                 db.setMessageText(socket.userID, wid, mid, message)
//                 db.setMessageText(wid, socket.userID, mid, message)
//                 socket.to(wid).emit('MESSAGE:CHANGED', {wid: socket.userID, mid, message})
//                 socket.emit('MESSAGE:CHANGED', {wid, mid, message})
//             }
//         })
//         socket.on('disconnect', async () => {
//             const matchingSockets = await io.in(socket.userID).allSockets()
//             const isDisconnected = matchingSockets.size === 0
//             if (isDisconnected) {
//                 socket.broadcast.emit('USER:DISCONNECTED', {userID: socket.userID, connect: false})
//                 sessionStore.saveSession(socket.sessionID, {
//                     userID: socket.userID,
//                     username: socket.username,
//                     connected: false,
//                 })
//                 db.connect(socket.userID, false)
//             }
//         })
//         socket.on('MESSAGE:READ', (wid, mid) => {
//             if (wid === 'chat') {
//                 io.emit('MESSAGE:READED', {wid, mid})
//             } else {
//                 socket.to(wid).emit('MESSAGE:READED', {wid: socket.userID, mid})
//                 socket.emit('MESSAGE:READED', {wid, mid})
//             }
//             db.setMessageRead(socket.userID, wid, mid)
//         })
//         socket.on('MESSAGE:DELETE', (wid, mid) => {
//             db.deleteMessage(socket.userID, wid, mid)
//             if (wid === 'chat') {
//                 io.emit('MESSAGE:DELETED', {wid, mid})
//             } else if (wid === socket.userID) {
//                 socket.emit('MESSAGE:DELETED', {wid, mid})
//             } else {
//                 socket.to(wid).emit('MESSAGE:DELETED', {wid: socket.userID, mid})
//                 socket.emit('MESSAGE:DELETED', {wid, mid})
//             }
//         })
//     })
// }
// const crypto = require('crypto')
// const {InMemorySessionStore} = require('../store/sessionstore')
// const {ChatStore} = require('../store/chatstore')
// const randomId = () => crypto.randomBytes(8).toString('hex')
// const sessionStore = new InMemorySessionStore()
// const db = new ChatStore()
// const {nanoid} = require('nanoid')

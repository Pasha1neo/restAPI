const {nanoid} = require('nanoid')
const crypto = require('crypto')
const {InMemorySessionStore} = require('./sessionStore')
const randomId = () => crypto.randomBytes(8).toString('hex')
const sessionStore = new InMemorySessionStore()
const LOCALDB = new Map([['messagesData', new Map([['global', new Map()]])]])
const messagesdb = LOCALDB.get('messagesData')

function socketModule(io) {
    io.use((socket, next) => {
        const sessionID = socket.handshake.auth.sessionID
        if (sessionID) {
            const session = sessionStore.findSession(sessionID)
            if (session) {
                socket.sessionID = sessionID
                socket.userID = session.userID
                socket.username = session.username
                return next()
            }
        }
        const username = socket.handshake.auth.username
        if (!username) {
            return next(new Error('invalid username'))
        }
        socket.sessionID = randomId()
        socket.userID = randomId()
        socket.username = username
        next()
    })
    io.on('connection', (socket) => {
        sessionStore.saveSession(socket.sessionID, {
            userID: socket.userID,
            username: socket.username,
            connected: true,
        })
        socket.emit('session', {
            sessionID: socket.sessionID,
            userID: socket.userID,
        })
        socket.join(socket.userID)
        if (!messagesdb.has(socket.userID)) {
            messagesdb.set(socket.userID, new Map([]))
        }
        const users = [
            {key: 'global', value: {userID: 'global', username: 'Общий чат', connected: true}},
        ]
        sessionStore.findAllSessions().forEach((session) => {
            users.push({
                key: session.userID,
                value: {
                    userID: session.userID,
                    username: session.username,
                    connected: session.connected,
                },
            })
        })
        socket.on('upload_users', (cb) => {
            cb(users)
        })
        socket.broadcast.emit('user connected', {
            key: socket.userID,
            value: {
                userID: socket.userID,
                username: socket.username,
                connected: true,
            },
        })
        socket.on('getMessagesData', (dataUpload) => {
            const messagesData = []
            messagesdb.get(socket.userID).forEach((value, key) => {
                const Value = []
                value.forEach((value, key) => {
                    Value.push({key, value})
                })
                messagesData.push({key: key, value: Value})
            })
            dataUpload(messagesData)
        })
        socket.on('sendMessage', ({toUserID, msg}) => {
            const {mid, from, message} = {mid: nanoid(4), from: socket.userID, message: msg}
            if (messagesdb.get(socket.userID).has(toUserID)) {
                messagesdb.get(socket.userID).get(toUserID).set(mid, {from, message})
            } else {
                messagesdb.get(socket.userID).set(toUserID, new Map().set(mid, {from, message}))
                if (messagesdb.get(toUserID).has(socket.userID)) {
                    messagesdb.get(toUserID).get(socket.userID).set(mid, {from, message})
                } else {
                    messagesdb.get(toUserID).set(socket.userID, new Map().set(mid, {from, message}))
                }
            }
            if (toUserID === 'global') {
                io.emit('newMessage', {
                    key: toUserID,
                    value: {key: mid, value: {from, message}},
                })
            } else if (toUserID === socket.userID) {
                socket.emit('newMessage', {
                    key: toUserID,
                    value: {key: mid, value: {from, message}},
                })
            } else {
                socket.to(toUserID).emit('newMessage', {
                    key: socket.userID,
                    value: {key: mid, value: {from, message}},
                })
                socket.emit('newMessage', {
                    key: toUserID,
                    value: {key: mid, value: {from, message}},
                })
            }
        })
        socket.on('disconnect', async () => {
            const matchingSockets = await io.in(socket.userID).allSockets()
            const isDisconnected = matchingSockets.size === 0
            if (isDisconnected) {
                socket.broadcast.emit('user disconnected', socket.userID)
                sessionStore.saveSession(socket.sessionID, {
                    userID: socket.userID,
                    username: socket.username,
                    connected: false,
                })
            }
        })
    })
}

module.exports.socketModule = socketModule

// function socketModule(io) {
// io.use((socket, next) => {
//     const sessionID = socket.handshake.auth.sessionID
//     if (sessionID) {
//         const session = sessionStore.findSession(sessionID)
//         if (session) {
//             socket.sessionID = sessionID
//             socket.userID = session.userID
//             socket.username = session.username
//             return next()
//         }
//     }
//     const username = socket.handshake.auth.username
//     if (!username) {
//         return next(new Error('invalid username'))
//     }
//     socket.sessionID = randomId()
//     socket.userID = randomId()
//     socket.username = username
//     next()
// })
//     io.on('connection', (socket) => {
// sessionStore.saveSession(socket.sessionID, {
//     userID: socket.userID,
//     username: socket.username,
//     connected: true,
// })
// socket.emit('session', {
//     sessionID: socket.sessionID,
//     userID: socket.userID,
// })
// socket.join(socket.userID)
// const users = []
// sessionStore.findAllSessions().forEach((session) => {
//     users.push({
//         key: session.userID,
//         value: {
//             userID: session.userID,
//             username: session.username,
//             connected: session.connected,
//         },
//     })
// })
// socket.on('upload_users', (cb) => {
//     cb(users)
// })
// socket.broadcast.emit('user connected', {
//     key: socket.userID,
//     value: {
//         userID: socket.userID,
//         username: socket.username,
//         connected: true,
//     },
// })
//         socket.on('upload_message', (dataUpload) => {
//             const dataMessages = localdbMessages.get('messages')
//             dataUpload(dataMessages)
//         })
//         socket.on('message', (msg) => {
//             console.log(msg)
//             const message = {mid: nanoid(4), message: msg.message, login: msg.login}
//             localdbMessages.get('messages').push(message)

//             io.emit('message', message)
//         })
//         socket.on('private message', ({data: {content, from, to}}) => {
//             socket
//                 .to(to)
//                 .to(socket.userID)
//                 .emit('private message', {
//                     content,
//                     from: {from, userId: socket.userID},
//                     to,
//                 })
//         })
//     socket.on('disconnect', async () => {
//         const matchingSockets = await io.in(socket.userID).allSockets()
//         const isDisconnected = matchingSockets.size === 0
//         if (isDisconnected) {
//             socket.broadcast.emit('user disconnected', socket.userID)
//             sessionStore.saveSession(socket.sessionID, {
//                 userID: socket.userID,
//                 username: socket.username,
//                 connected: false,
//             })
//         }
//     })
// })
// }

// необходимо если будет база данных сделать постоянные id иначе будут проблемы
//messagesdb = [userID: 'userId', value: [{messagesData: "messagesData",  value:[{mid: '1', message: 'Привет'}]]}],
// const messagesdb = new Map([
//     'messagesData',
//     new Map(['userID', new Map([{mid: '1', msg: 'Привет'}])]),
// ])

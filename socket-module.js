const crypto = require('crypto')
const {InMemorySessionStore} = require('./sessionStore')
const {ChatStore} = require('./ChatStore')
const randomId = () => crypto.randomBytes(8).toString('hex')
const sessionStore = new InMemorySessionStore()
const db = new ChatStore()

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

        sessionStore.findAllSessions().forEach((session) => {
            db.user(session.userID, session.username, session.connected)
        })

        socket.on('GET:USERS', (cb) => {
            cb(db.getUsersData())
        })
        socket.broadcast.emit('USER:CONNECTED', {
            userID: socket.userID,
            username: socket.username,
            connected: true,
        })
        socket.on('GET:MESSAGESDATA', (dataUpload) => {
            dataUpload(db.getDialogs(socket.userID))
        })
        socket.on('SEND:MESSAGE', ({tid, msg}) => {
            const message = db.message(socket.userID, tid, msg)
            if (socket.userID === tid) {
                socket.emit('NEW:MESSAGE', {wid: socket.userID, message})
            } else if (tid === 'chat') {
                io.emit('NEW:MESSAGE', {wid: 'chat', message})
            } else {
                socket.to(tid).emit('NEW:MESSAGE', {wid: socket.userID, message})
                socket.emit('NEW:MESSAGE', {wid: tid, message})
            }
        })
        socket.on('disconnect', async () => {
            const matchingSockets = await io.in(socket.userID).allSockets()
            const isDisconnected = matchingSockets.size === 0
            if (isDisconnected) {
                socket.broadcast.emit('USER:DISCONNECTED', socket.userID)
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

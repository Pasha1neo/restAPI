const {nanoid} = require('nanoid')
const crypto = require('crypto')
const {InMemorySessionStore} = require('./sessionStore')
const randomId = () => crypto.randomBytes(8).toString('hex')

const localdbMessages = new Map([['messages', []]])
const sessionStore = new InMemorySessionStore()

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
        console.log('подключено')
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
        const users = []
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
        socket.on('upload_message', (dataUpload) => {
            const dataMessages = localdbMessages.get('messages')
            dataUpload(dataMessages)
        })
        socket.on('message', (msg) => {
            console.log(msg)
            const message = {mid: nanoid(4), message: msg.message, login: msg.login}
            localdbMessages.get('messages').push(message)

            io.emit('message', message)
        })
        socket.on('private message', ({data}) => {
            console.log(data)
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

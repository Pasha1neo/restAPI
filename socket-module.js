const {nanoid} = require('nanoid')
const crypto = require('crypto')
const {InMemorySessionStore} = require('./sessionStore')
const randomId = () => crypto.randomBytes(8).toString('hex')
const sessionStore = new InMemorySessionStore()
const DB = {
    _DataBase: [],
    _users: [],
    getUsersData() {
        return this._users
    }, // доп функции другого порядка
    _setUsersData(id, name, con) {
        this.getUsersData().push({
            userID: id,
            username: name,
            connected: con,
        })
    }, // доп функции другого порядка
    _getUser(id) {
        return this._DataBase.find((u) => {
            if (u.id === id) {
                return true
            }
        })
    }, // вывод пользователя по id
    _setUser(id, name) {
        const user = {
            id,
            name,
            dialogs: [],
        }
        this._DataBase.push(user)
        return this._getUser(id)
    }, // создание пользователя
    user(id, name, connection) {
        const x = this._getUser(id)
        if (x) {
            return x
        } else {
            this._setUsersData(id, name, connection)
            return this._setUser(id, name)
        }
    }, // определение есть ли пользователь в бд и по необходимости его создаёт и выводит
    getUserDialogs(id) {
        return this._getUser(id).dialogs
    }, // Вывод всех диалогов одного пользователя
    getUserDialog(id, did) {
        return this.getUserDialogs(id).find((dialog) => {
            if (dialog.did === did) {
                return true
            }
        })
    }, // вывод определенного диалога по did
    _setUserDialog(fid, tid) {
        this.getUserDialogs(fid).push({did: fid + tid, users: [fid, tid], messages: []})
        if (fid !== tid) {
            this.getUserDialogs(tid).push({did: fid + tid, users: [fid, tid], messages: []})
        }
    }, // создание нового диалога для двух собеседников по fid и tid
    _addMessageInData(fid, tid, msg) {
        this.getUserDialog(fid, fid + tid).messages.push({mid: fid + tid, fid, tid, msg})
        if (fid !== tid) {
            this.getUserDialog(tid, fid + tid).messages.push({mid: fid + tid, fid, tid, msg})
        }
    }, // пушит сообщение в дату
    setNewMessage(fid, tid, msg) {
        try {
            const x = this.getUserDialog(fid, fid + tid)
            if (!x) {
                this._setUserDialog(fid, tid)
            }
            this._addMessageInData(fid, tid, msg)
        } catch (error) {
            console.log('ошибка получения пользователя')
        }
    }, // создаёт новое сообщение и возвращает его
}
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
            DB.user(session.userID, session.username, session.connected)
        })
        socket.on('upload_users', (cb) => {
            cb(DB.getUsersData())
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
            dataUpload(DB.getUserDialogs(socket.userID))
        })
        socket.on('sendMessage', ({toUserID, msg}) => {})
    })
}

module.exports.socketModule = socketModule

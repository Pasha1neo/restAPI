const _ = require('lodash')
const {nanoid} = require('nanoid')
function getTime() {
    const data = new Date().toLocaleString('ru-RU')
    const data1 = data.split(',')
    return {ymd: data1[0], hm: data1[1].slice(1, 6)}
}
class ChatStore {
    constructor() {
        this._UsersData = []
        this._GlobalChat = {
            wid: 'chat',
            users: [],
            messages: [],
        }
    }
    _getFullUsersData() {
        return this._UsersData
    }
    getUsersData() {
        return this._UsersData.map(({userID, username, connected}) => {
            return {userID, username, connected}
        })
    }
    _setUserInData(user) {
        this._UsersData.push(user)
    }
    _getUser(id) {
        return _.find(this._UsersData, {userID: id})
    }
    _setUser(id, name, connect) {
        const user = {
            userID: id,
            username: name,
            connected: connect,
            dialogs: [],
        }
        this._setUserInData(user)
    }
    user(id, name, connect) {
        const user = this._getUser(id)
        if (!user && id && name) {
            this._setUser(id, name, connect)
            return this._getUser(id)
        } else if (!user && id) {
            console.log(`Пользователя с id - ${id} не сущетсвует`)
            return false
        }
        return user
    }
    getDialogs(id) {
        const dialogs = [...this._getUser(id).dialogs, this._GlobalChat]
        return dialogs
    }
    _getDialogs(id) {
        return this._getUser(id).dialogs
    }
    _getDialog(fid, tid) {
        const x = _.find(this._getDialogs(fid), {wid: tid})
        if (x) return x
        return false
    }
    _setDialog(fid, tid) {
        const dialog = {
            wid: tid,
            users: [fid, tid],
            messages: [],
        }
        const dialogs = this._getDialogs(fid)
        dialogs.push(dialog)
        return dialogs
    }
    _checkDialog(fid, tid) {
        if (!this._getDialog(fid, tid)) {
            const x = this._setDialog(fid, tid)
        }

        if (!this._getDialog(tid, fid)) {
            const y = this._setDialog(tid, fid)
        }
    }
    _setMessage(fid, tid, message) {
        if (fid !== tid) {
            this._getDialog(tid, fid).messages.push(message)
        }
        this._getDialog(fid, tid).messages.push(message)
    }
    _setGlobalMessage(message) {
        this._GlobalChat.messages.push(message)
    }
    message(fid, tid, msg) {
        try {
            const message = {
                mid: nanoid(4),
                from: fid,
                message: msg,
                read: false,
                time: getTime(),
            }
            if (tid !== 'chat') {
                this._checkDialog(fid, tid)
                this._setMessage(fid, tid, message)
                return message
            } else {
                this._setGlobalMessage(message)
                return message
            }
        } catch (error) {
            console.log('Ошибка хранилища чата')
            return false
        }
    }
    connect(id, connected) {
        const user = this._getUser(id)
        if (connected === user.connected) {
            return null
        }
        return (user.connected = connected)
    }
    _getMessageByMid(fid, wid, mid) {
        return _.find(this._getDialog(fid, wid).messages, {mid: mid})
    }
    setMessageText(fid, wid, mid, message) {
        try {
            this._getMessageByMid(fid, wid, mid).message = message
        } catch (error) {
            console.log('ошибка данные =', fid, wid, mid, message)
        }
    }
    setMessageTextInGlobalChat(mid, message) {
        _.find(this._GlobalChat.messages, {mid}).message = message
    }
    setMessageRead(fid, wid, mid) {
        if (wid === 'chat') {
            _.find(this._GlobalChat.messages, {mid}).read = true
        } else {
            this._getMessageByMid(fid, wid, mid).read = true
            this._getMessageByMid(wid, fid, mid).read = true
        }
    }
}
module.exports = {ChatStore}

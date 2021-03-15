import socket from '../socket'
export default {
    data() {
        return {
            selectedUser: null,
            users: [],
        }
    },
    created() {
        socket.on('connect', () => {
            this.users.forEach((user) => {
                if (user.self) {
                    user.connected = true
                }
            })
        })
        socket.on('disconnect', () => {
            this.users.forEach((user) => {
                if (user.self) {
                    user.connected = false
                }
            })
        })
        const initReactiveProperties = (user) => {
            user.connected = true
            user.messages = []
            user.hasNewMessages = false
        }
        socket.on('users', (users) => {
            users.forEach((user) => {
                user.self = user.userID === socket.id
                initReactiveProperties(user)
            })
            this.users = users.sort((a, b) => {
                if (a.self) return -1
                if (b.self) return 1
                if (a.username < b.username) return -1
                return a.username > b.username ? 1 : 0
            })
        })
        socket.on('user connected', (user) => {
            initReactiveProperties(user)
            this.users.push(user)
        })
        socket.on('user disconnected', (id) => {
            for (let i = 0; i < this.users.length; i++) {
                const user = this.users[i]
                if (user.userID === id) {
                    user.connected = false
                    break
                }
            }
        })
        socket.on('private message', ({content, from}) => {
            for (let i = 0; i < this.users.length; i++) {
                const user = this.users[i]
                if (user.userID === from) {
                    user.messages.push({
                        content,
                        fromSelf: false,
                    })
                    if (user !== this.selectedUser) {
                        user.hasNewMessages = true
                    }
                    break
                }
            }
        })
    },
    destroyed() {
        socket.off('connect')
        socket.off('disconnect')
        socket.off('users')
        socket.off('user connected')
        socket.off('user disconnected')
        socket.off('private message')
    },
}

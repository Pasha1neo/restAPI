const {nanoid} = require('nanoid')

let localdb = new Map([['messages', []]])

module.exports = (socket, io) => {
    console.log('Подключено')
    socket.on('message', (msg) => {
        const message = {mid: nanoid(4), message: msg.message, login: msg.login}
        localdb.get('messages').push(message)
        console.log(message)
        io.emit('message', message)
    })
    socket.on('upload_message', (dataUpload) => {
        const dataMessages = localdb.get('messages')
        dataUpload(dataMessages)
    })
    socket.on('disconnect', () => {
        console.log('Отключено')
    })
}

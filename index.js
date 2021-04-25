const PORT = process.env.PORT || 5000
const cors = require('cors')
const mongoose = require('mongoose')
const express = require('express')
const app = express()
const authRouter = require('./route/auth')
const postRouter = require('./route/post')
const fileRouter = require('./route/file')
const {socketModule} = require('./controller/socket-module')
const server = require('http').createServer(app)
const io = require('socket.io')(server, {
    cors: {
        origin: ['http://192.168.0.103:3000', 'http://localhost:3000'],
        methods: ['GET', 'POST'],
    },
})
const fileUpload = require('express-fileupload')

app.use(cors())
app.use(express.json())
app.use(express.static('static'))
app.use(fileUpload())
app.use('/api/auth', authRouter)
app.use('/api/post', postRouter)
app.use('/api/file', fileRouter)
//сделать модуль https
//воспользоваться штуками из книги (телефон)
const start = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/project-adaptive', {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            retryWrites: true,
        })
        socketModule(io)
    } catch (error) {
        console.log(error)
    }
}
start()
server.listen(PORT, (err) => {
    if (err) {
        throw Error(err)
    }
})

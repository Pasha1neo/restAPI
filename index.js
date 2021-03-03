const PORT = process.env.PORT || 5000
const cors = require('cors')
const mongoose = require('mongoose')
const express = require('express')
const app = express()
const server = require('http').createServer(app)
const authRouter = require('./route/auth')

const socketController = require('./socket-module')
const io = require('socket.io')(server)
app.use(express.json())
app.use(cors())
app.use('/api/auth', authRouter)

const start = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/project-adaptive', {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        })
        io.on('connection', (socket) => {
            socketController(socket, io)
        })
        server.listen(PORT, (err) => {
            if (err) {
                throw Error(err)
            }
            console.log(`Сервер запущен на  http://localhost:${PORT}/`)
        })
    } catch (error) {
        console.log(error)
    }
}
start()

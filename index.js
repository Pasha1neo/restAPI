const PORT = process.env.PORT || 5000
const cors = require('cors')
const mongoose = require('mongoose')
const express = require('express')
const app = express()
const authRouter = require('./route/auth')
const {socketModule} = require('./controller/socket-module')
const server = require('http').createServer(app)
const io = require('socket.io')(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
})
app.use(express.json())
app.use(cors())
app.use('/api/auth', authRouter)
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

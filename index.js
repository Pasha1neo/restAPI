const PORT = process.env.PORT || 5000
const cors = require('cors')
const mongoose = require('mongoose')
const express = require('express')
const app = express()
const authRouter = require('./route/auth')
const {socketModule} = require('./socket-module')
const server = require('http').createServer(app)
const io = require('socket.io')(server, {
    cors: {
        origin: 'https://project-adaptive.herokuapp.com/',
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
        await mongoose.connect(
            'mongodb+srv://Pasha1neo:pasha1neo@cluster0.lwubz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
            {
                useUnifiedTopology: true,
                useNewUrlParser: true,
            }
        )
        console.log('Бд запущена')
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

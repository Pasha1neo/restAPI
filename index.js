const PORT = process.env.PORT || 5000
const cors = require('cors')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const passport = require('passport')
const express = require('express')
const fileUpload = require('express-fileupload')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server, {
    cors: {
        origin: [
            'https://gexon.herokuapp.com',
            'https://project-adaptive.herokuapp.com',
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://192.168.0.100:3000',
            'http://192.168.0.101:3000',
            'http://192.168.0.102:3000',
            'http://192.168.0.103:3000',
        ],
        methods: ['GET', 'POST'],
    },
})
const signRouter = require('./route/sign')
const profileRouter = require('./route/profile')
const usersRouter = require('./route/users')
const socketService = require('./services/socket')
const passportModule = require('./middleware/passport')

//----------------------------------------- END OF IMPORTS---------------------------------------------------

app.use(cookieParser('pasha1neo'))
app.use(express.static('static'))
app.use(express.json())
app.use(fileUpload())
app.use(
    cors({
        origin: [
            'https://gexon.herokuapp.com',
            'https://project-adaptive.herokuapp.com',
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://192.168.0.100:3000',
            'http://192.168.0.101:3000',
            'http://192.168.0.102:3000',
            'http://192.168.0.103:3000',
        ],
        credentials: true,
    })
)
app.use(passport.initialize())
passportModule(passport)

//----------------------------------------- END OF MIDDLEWARE---------------------------------------------------
app.use('/sign', signRouter)
app.use('/profile', profileRouter)
app.use('/users', usersRouter)

//----------------------------------------- END OF ROUTES---------------------------------------------------

server.listen(PORT, () => {
    try {
        mongoose.connect(
            'mongodb+srv://Pasha1neo:pasha1neo@project-adaptive.lwubz.mongodb.net/project-adaptive?retryWrites=true&w=majority',
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useCreateIndex: true,
                useFindAndModify: false,
            }
        )
        socketService(io)
        console.log(`http://localhost:${PORT}`)
    } catch (error) {
        console.log('index')
    }
})

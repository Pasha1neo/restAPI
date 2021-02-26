const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const PORT = process.env.PORT || 5000

const app = express()

const authRouter = require('./route/auth')

app.use(express.json())
app.use(cors())
app.use('/api/auth', authRouter)
const start = async () => {
    try {
        mongoose.connect('mongodb://127.0.0.1:27017/project-adaptive', {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        })
        app.listen(PORT, () => {
            console.log(`Сервер запущен на  http://localhost:${PORT}/`)
        })
    } catch (error) {
        console.log(error)
    }
}
start()

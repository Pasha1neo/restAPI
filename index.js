const express = require('express')
const mongoose = require('mongoose')
const app = express()
const port = 3000
const cors = require('cors')
mongoose.connect('mongodb://localhost/pasha1neo', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
app.use(cors())
app.use(express.json())
app.use('/api', require('./api'))
app.listen(port, () => {
    console.log(`Сервер запущен по адресу http://localhost:${port}/`)
})

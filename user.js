const {Schema, model} = require('mongoose')

const UserSchema = new Schema({
    login: {
        type: String,
        required: true,
        versionKey: false,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        versionKey: false,
        unique: true,
    },
})

module.exports = model('user', UserSchema)

const {Schema, model} = require('mongoose')

const UserSchema = new Schema(
    {
        login: {
            type: String,
            required: true,
            unique: true,
        },
        nickname: {
            type: String,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        clearPassword: {
            type: String,
        },
        posts: {
            type: Array,
        },
        avatar: {
            type: String,
        },
    },
    {versionKey: false}
)

module.exports = model('user', UserSchema)

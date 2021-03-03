const {Schema, model} = require('mongoose')

const UserSchema = new Schema(
    {
        login: {
            type: String,
            required: true,
            unique: true,
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
    },
    {versionKey: false}
)

module.exports = model('user', UserSchema)

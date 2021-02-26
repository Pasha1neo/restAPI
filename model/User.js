const {Schema, model} = require('mongoose')

const UserSchema = new Schema(
    {
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

module.exports = model('UserModel', UserSchema)

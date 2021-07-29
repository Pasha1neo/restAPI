const {Schema, model} = require('mongoose')

const userSchema = new Schema(
    {
        login: {
            type: String,
            required: true,
            unique: true,
        },
        nickname: String,
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        clearPassword: String,
        posts: [{type: Schema.Types.ObjectId, ref: 'post'}],
        avatar: String,
        dialogs: [{type: Schema.Types.ObjectId, ref: 'dialog'}],
        onlineStatus: Boolean,
        friends: [{type: Schema.Types.ObjectId, ref: 'friend'}],
    },
    {versionKey: false}
)

module.exports = model('user', userSchema)

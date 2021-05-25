const {Schema, model} = require('mongoose')

const messageSchema = new Schema(
    {
        fid: {type: Schema.Types.ObjectId, ref: 'user'},
        text: String,
        time: String,
        data: String,
        read: Boolean,
    },
    {versionKey: false}
)

const dialogSchema = new Schema(
    {
        wid: {type: Schema.Types.ObjectId, ref: 'user'},
        messages: [{type: Schema.Types.ObjectId, ref: 'message'}],
    },
    {versionKey: false}
)

const postSchema = new Schema(
    {
        text: String,
        fid: {type: Schema.Types.ObjectId, ref: 'user'},
        data: String,
        time: String,
    },
    {versionKey: false}
)

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
    },
    {versionKey: false}
)

module.exports.Message = model('message', messageSchema)
module.exports.Dialog = model('dialog', dialogSchema)
module.exports.Post = model('post', postSchema)
module.exports.User = model('user', userSchema)

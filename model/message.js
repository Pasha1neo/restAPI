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
module.exports = model('message', messageSchema)

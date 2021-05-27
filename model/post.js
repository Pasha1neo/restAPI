const {Schema, model} = require('mongoose')

const postSchema = new Schema(
    {
        text: String,
        fid: {type: Schema.Types.ObjectId, ref: 'user'},
        data: String,
        time: String,
    },
    {versionKey: false}
)

module.exports = model('post', postSchema)

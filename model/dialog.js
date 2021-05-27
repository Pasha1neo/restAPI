const {Schema, model} = require('mongoose')

const dialogSchema = new Schema(
    {
        wid: {type: Schema.Types.ObjectId, ref: 'user'},
        messages: [{type: Schema.Types.ObjectId, ref: 'message'}],
    },
    {versionKey: false}
)

module.exports = model('dialog', dialogSchema)

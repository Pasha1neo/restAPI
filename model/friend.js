const {Schema, model} = require('mongoose')

const friendSchema = new Schema(
    {
        fid: {type: Schema.Types.ObjectId, ref: 'user'},
        invited: {type: Schema.Types.ObjectId, ref: 'user'},
        dataAdded: {data: String, time: String},
        isFriend: Boolean,
        isInvited: Boolean,
        isRejected: Boolean,
    },
    {versionKey: false}
)

module.exports = model('friend', friendSchema)

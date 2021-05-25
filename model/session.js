const {Schema, model} = require('mongoose')

const SessionSchema = new Schema(
    {
        userId: {
            type: String,
        },
        nickname: String,
        connected: Boolean,
    },
    {versionKey: false}
)

module.exports = model('session', SessionSchema)

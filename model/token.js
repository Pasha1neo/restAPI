const {Schema, model} = require('mongoose')

const TokenSchema = new Schema(
    {
        tokenId: String,
        userId: String,
    },
    {versionKey: false}
)

module.exports = model('token', TokenSchema)

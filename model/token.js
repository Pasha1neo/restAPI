const {Schema, model} = require('mongoose')

const tokenSchema = new Schema(
    {
        tokenId: String,
        userId: String,
    },
    {versionKey: false}
)

module.exports = model('token', tokenSchema)

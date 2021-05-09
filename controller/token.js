const {verifyToken} = require('../services/refresh')
const {refresh} = require('../services/refresh')
const Token = require('../model/token')

class TokenController {
    async refresh(req, res, next) {
        try {
            const {token} = req.cookies?.token
            const vToken = verifyToken(token)
            if (vToken) {
                const {userId} = await Token.findOne({tokenId: vToken})
                const tokens = refresh(userId)
                return res
                    .status(200)
                    .cookie('token', {token: tokens.refreshToken}, {maxAge: 604800000})
                    .send({token: tokens.accessToken})
            }
            return res.status(200).send({resultcode: 100, message: 'Перезайдите заново'})
        } catch (error) {
            return res.status(200).send({resultcode: 401, message: 'Ты или украл ключ или дурак'})
        }
    }
}
module.exports = new TokenController()

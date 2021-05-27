const {nanoid} = require('nanoid')
const Token = require('../model/token')
const jwt = require('jsonwebtoken')
const secret = 'pasha1neo'

const verifyToken = (token) => {
    return jwt.verify(token, secret).id
}
module.exports.verifyToken = verifyToken

const tokens = {
    access: {
        type: 'access',
        expiresIn: '1h',
    },
    refresh: {
        type: 'refresh',
        expiresIn: '7d',
    },
}

const AccessToken = (userId) => {
    const payload = {
        userId,
        type: tokens.access.type,
    }
    return jwt.sign(payload, secret, {expiresIn: tokens.access.expiresIn})
}
const RefreshToken = () => {
    const payload = {
        id: nanoid(10),
        type: tokens.refresh.type,
    }
    return {
        id: payload.id,
        token: jwt.sign(payload, secret, {expiresIn: tokens.refresh.expiresIn}),
    }
}
const replaceDbRefreshToken = async (tokenId, userId) => {
    await Token.findOneAndRemove({userId})
    await Token.create({tokenId, userId})
    return
}

const refresh = (userId) => {
    const accessToken = AccessToken(userId)
    const refreshToken = RefreshToken()
    replaceDbRefreshToken(refreshToken.id, userId)
    return {
        accessToken,
        refreshToken: refreshToken.token,
    }
}

module.exports.refresh = refresh

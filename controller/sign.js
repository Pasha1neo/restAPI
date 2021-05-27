const bcrypt = require('bcrypt')
const {User} = require('../model/User')
const {refresh} = require('../services/refresh')
class sign {
    async up(req, res) {
        try {
            const {login, email, password} = req.body
            const hashPassword = await bcrypt.hash(password, 8)
            await User.create({
                login,
                email,
                password: hashPassword,
                clearPassword: password,
            })
            res.json(true)
        } catch (error) {
            console.log('controllers/sign/up')
            res.send(false)
        }
    }

    async in(req, res) {
        try {
            const {rememberMe} = req.body
            const tokens = await refresh(req.user.userId)
            return res
                .cookie('token', {token: tokens.refreshToken}, {maxAge: 604800000})
                .json({user: req.user, token: tokens.accessToken})
        } catch (error) {
            res.send(false)
            console.log('controllers/sign/in')
        }
    }

    async auth(req, res) {
        try {
            const user = await User.findById(
                req.user,
                'login email nickname posts avatar'
            ).populate({
                path: 'posts',
                populate: {path: 'fid', select: 'login nickname'},
            })
            if (!user) return res.json(false)
            res.json({
                user: {
                    userId: user._id,
                    login: user.login,
                    email: user.email,
                    nickname: user?.nickname,
                    avatar: user?.avatar,
                    posts: user?.posts,
                },
            })
        } catch (error) {
            console.log('controllers/sign/auth')
            res.send(false)
        }
    }
    async out(req, res) {
        try {
            return res.clearCookie('token').json(true)
        } catch (error) {
            res.send(true)
            console.log('controllers/sign/out')
        }
    }
}
module.exports = new sign()

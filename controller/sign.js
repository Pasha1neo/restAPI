const bcrypt = require('bcrypt')
const User = require('../model/user')
const {refresh} = require('../services/refresh')

class AuthController {
    async SignUp(req, res) {
        try {
            const {login, nickname, email, password} = req.body
            const emailCheck = await User.findOne(
                {email},
                {login: 0, password: 0, clearPassword: 0}
            )
            const loginCheck = await User.findOne(
                {login},
                {email: 0, password: 0, clearPassword: 0}
            )
            if (emailCheck) {
                return res.status(200).json({
                    resultcode: 201,
                    message: `Пользователь ${email} уже существует `,
                })
            } else if (loginCheck) {
                return res.status(200).json({
                    resultcode: 201,
                    message: `Пользователь ${login} уже существует `,
                })
            }
            const hashPassword = await bcrypt.hash(password, 8)
            const user = new User({
                login,
                nickname,
                email,
                password: hashPassword,
                clearPassword: password,
            })
            await user.save()
            res.status(200).json({resultcode: 200, user})
        } catch (error) {
            console.log(error, 'ошибка регистрации')
            res.send({resultcode: 100, message: 'Ошибка Регистрации на сервере'})
        }
    }

    async SignIn(req, res, next) {
        try {
            const tokens = await refresh(req.user.id)
            return res
                .cookie('token', {token: tokens.refreshToken}, {maxAge: 604800000})
                .json({user: req.user, token: tokens.accessToken})
        } catch (error) {
            res.send({resultcode: 100, message: 'Ошибка Авторизации на сервере'})
            console.log('Ошибка Авторизации на сервере')
        }
    }
    async Auth(req, res) {
        try {
            const user = await User.findById(req.user)
            if (!user) {
                res.json({
                    resultcode: 101,
                })
            }
            res.json({
                resultcode: 200,
                user: {
                    id: user._id,
                    login: user.login,
                    email: user.email,
                    nickname: user?.nickname,
                    posts: user?.posts,
                    avatar: user?.avatar,
                },
            })
        } catch (error) {
            console.log(req.user)
            res.send({resultcode: 100, message: 'Ошибка контроллера аутентификации на сервере'})
        }
    }
}
module.exports = new AuthController()

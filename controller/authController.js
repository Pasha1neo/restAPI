const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const UserModel = require('../model/User')

const SECRETKEY = 'pasha1neo'
/* 
resultcodes
100 = ошибка сервера
200 = всё окей
201 = уже существует
202 = не существует
203 = что то не правильно
101 = Ошибка авторизации по токену
102 = Истекло время жизни токена
*/

class AuthController {
    async SignUp(req, res) {
        try {
            const {login, email, password} = req.body
            const emailCheck = await UserModel.findOne(
                {email},
                {login: 0, password: 0, clearPassword: 0}
            )
            const loginCheck = await UserModel.findOne(
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
            const hashPassword = await bcrypt.hash(password, 8) //Сделать безопасное и правильное хеширование
            const user = new UserModel({
                login,
                email,
                password: hashPassword,
                clearPassword: password,
            })
            await user.save()
            res.status(200).json({resultcode: 200})
        } catch (error) {
            // console.log(error)
            res.send({resultcode: 100, message: 'Ошибка Регистрации на сервере'})
        }
    }
    async SignIn(req, res) {
        try {
            const {login, password, rememberMe} = req.body
            const user = await UserModel.findOne({login})
            const passValid = bcrypt.compareSync(password, user.password)
            if (user && passValid) {
                const token = jwt.sign({id: user.id}, SECRETKEY, {
                    expiresIn: rememberMe ? '5h' : '30m',
                })
                return res.status(200).json({
                    resultcode: 200,
                    token,
                    user: {
                        id: user.id,
                        login: user.login,
                        email: user.email,
                        avatar: user.avatar,
                    },
                })
            }

            if (!passValid) {
                return res.status(200).json({resultcode: 203, message: 'Неправильный пароль'})
            }
            return res.json({resultcode: 202, message: 'Пользователь не существует'})
        } catch (error) {
            console.log('ошибка')
            res.send({resultcode: 100, message: 'Ошибка авторизации на сервере'})
        }
    }
    async Auth(req, res) {
        try {
            const user = await UserModel.findOne({_id: req.user.id})
            if (!user) {
                res.json({
                    resultcode: 101,
                })
            }
            const token = jwt.sign({id: user.id}, SECRETKEY, {expiresIn: '5h'})
            res.json({
                resultcode: 200,
                token,
                user: {
                    id: user.id,
                    login: user.login,
                    email: user.email,
                    avatar: user.avatar,
                },
            })
        } catch (error) {
            console.log('Ошибка')
            res.send({resultcode: 100, message: 'Ошибка контроллера аутентификации на сервере'})
        }
    }
}
module.exports = new AuthController()

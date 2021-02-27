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
*/

class AuthController {
    async SignUp(req, res) {
        try {
            const {email, password} = req.body
            const ExistCheck = await UserModel.findOne({email})
            if (ExistCheck) {
                return res.status(200).json({
                    resultcode: 201,
                    message: `Пользователь с почтой ${email} уже существует `,
                })
            }
            const hashPassword = await bcrypt.hash(password, 8)
            const user = new UserModel({email, password: hashPassword, clearPassword: password})
            await user.save()
            res.status(200).json({resultcode: 200})
        } catch (error) {
            console.log(error)
            res.send({resultcode: 100, message: 'Ошибка Регистрации на сервере'})
        }
    }
    async SignIn(req, res) {
        try {
            const {email, password} = req.body
            const user = await UserModel.findOne({email})
            if (!user) {
                return res
                    .status(200)
                    .json({resultcode: 202, message: 'Такого пользователя не существует'})
            }
            const isPassValid = bcrypt.compareSync(password, user.password)
            if (!isPassValid) {
                return res.status(200).json({resultcode: 203, message: 'Неправильный пароль'})
            }
            const token = jwt.sign({id: user.id}, SECRETKEY, {expiresIn: '30s'})
            res.status(200).json({
                resultcode: 200,
                token,
                user: {
                    id: user.id,
                    email: user.email,
                },
            })
        } catch (error) {
            console.log(error)
            res.send({resultcode: 100, message: 'Ошибка авторизации на сервере'})
        }
    }
    async Auth(req, res) {
        try {
            const user = await UserModel.findOne({_id: req.user.id})
            const token = jwt.sign({id: user.id}, SECRETKEY, {expiresIn: '1h'})
            res.json({
                resultcode: 200,
                token,
                user: {
                    id: user.id,
                    email: user.email,
                },
            })
        } catch (error) {
            console.log(error)
            res.send({resultcode: 100, message: 'Ошибка контроллера аутентификации на сервере'})
        }
    }
}
module.exports = new AuthController()

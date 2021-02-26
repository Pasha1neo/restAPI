const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const UserModel = require('../model/User')

const SECRETKEY = 'pasha1neo'

class AuthController {
    async SignUp(req, res) {
        try {
            const {email, password} = req.body
            const ExistCheck = await UserModel.findOne({email})
            if (ExistCheck) {
                return res
                    .status(200)
                    .json({message: `Пользователь с почтой ${email} уже существует  `})
            }
            const hashPassword = await bcrypt.hash(password, 8)
            const user = new UserModel({email, password: hashPassword, clearPassword: password})
            await user.save()
            res.status(200).json({message: 'Пользователь успешно зарегестрирован'})
        } catch (error) {
            console.log(error)
            res.send({message: 'Ошибка Регистрации на сервере'})
        }
    }
    async SignIn(req, res) {
        try {
            const {email, password} = req.body
            const user = await UserModel.findOne({email})
            if (!user) {
                return res.status(200).json({message: 'Такого пользователя не существует'})
            }
            const isPassValid = bcrypt.compareSync(password, user.password)
            if (!isPassValid) {
                return res.status(200).json({message: 'Неправильный пароль'})
            }
            const token = jwt.sign({id: user.id}, SECRETKEY, {expiresIn: '1h'})
            return res.status(200).json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                },
            })
        } catch (error) {
            console.log(error)
            res.send({message: 'Ошибка авторизации на сервере'})
        }
    }
    async Auth(req, res) {
        try {
            const user = await UserModel.findOne({_id: req.user.id})
            const token = jwt.sign({id: user.id}, SECRETKEY, {expiresIn: '1h'})
            return res.json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                },
            })
        } catch (error) {
            console.log(error)
            res.send({message: 'Ошибка контроллера аутентификации на сервере'})
        }
    }
}
module.exports = new AuthController()

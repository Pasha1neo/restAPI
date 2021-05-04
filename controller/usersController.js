const UserModel = require('../model/User')
const {nanoid} = require('nanoid')

class UsersController {
    async setNickname(req, res) {
        try {
            const users = await UserModel.find({}, 'id nickname login avatar')
            return res.status(200).send(users)
        } catch (error) {
            console.log('Ошибка при выводе списка пользователей')
            return res.send({resultcode: 100, message: 'Ошибка при выводе списка пользователей'})
        }
    }
}

module.exports = new UsersController()

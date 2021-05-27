const {User} = require('../model/User')

class UsersController {
    async getUsers(req, res) {
        try {
            const users = await User.find({}, 'id nickname login avatar')
            return res.status(200).send(users)
        } catch (error) {
            console.log('Ошибка при выводе списка пользователей')
            return res.send({resultcode: 100, message: 'Ошибка при выводе списка пользователей'})
        }
    }
}

module.exports = new UsersController()

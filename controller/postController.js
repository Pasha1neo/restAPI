const UserModel = require('../model/User')
const {nanoid} = require('nanoid')

class PostController {
    async create(req, res) {
        try {
            const {text, id, name} = req.body
            const user = await UserModel.findOne({login: name})
            if (!user) {
                return res.send({resultcode: 101, message: 'Пользователь не найден'})
            }
            user.posts.push({postText: text, id: nanoid(6), authorName: name})
            user.save()
            return res.status(200).send({resultcode: 200, message: 'Пост создан'})
        } catch (error) {
            console.log(error)
            return res.send({resultcode: 100, message: 'Ошибка создания поста на сервере'})
        }
    }
    async get(req, res) {
        try {
            await UserModel.findById(req.body.id).exec((err, user) => {
                if (!user) {
                    return res.json({resultcode: 101, message: 'Пользователь не найден'})
                }
                return res.status(200).json({resultcode: 200, posts: user.posts})
            })
        } catch (error) {
            res.send({resultcode: 100, message: 'Ошибка получения данных на сервере'})
        }
    }
}
module.exports = new PostController()

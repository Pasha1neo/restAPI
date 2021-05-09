const UserModel = require('../model/user')
const {nanoid} = require('nanoid')
const fs = require('fs')

function getTime() {
    const data = new Date().toLocaleString('ru-RU')
    const data1 = data.split(',')
    return {data: data1[0], time: data1[1].slice(1, 6)}
}

function pathAvatar(name) {
    return `${__dirname}\\..\\static\\${name}`
}

class ProfileController {
    async setNickname(req, res) {
        try {
            const {nickname} = req.body
            const user = await UserModel.findById(req.user)
            if (!user) {
                return res.send({resultcode: 101, message: 'Пользователь не найден'})
            }
            user.nickname = nickname
            user.save()
            return res.status(200).send({resultcode: 200, nickname: user.nickname})
        } catch (error) {
            console.log('ошибка сет никнейма')
            return res.send({resultcode: 100, message: 'Ошибка изменения никнейма'})
        }
    }

    async createPost(req, res) {
        try {
            const {author, content, fid} = req.body
            const user = await UserModel.findById(fid)
            if (!user) {
                return res.send({resultcode: 101, message: 'Пользователь не найден'})
            }
            const TIME = getTime()
            const post = {content, pid: nanoid(6), author, fid, ...TIME}
            user.posts.push(post)
            user.save()
            return res.status(200).send({resultcode: 200, message: 'Пост создан', post})
        } catch (error) {
            console.log('ошибка создания поста')
            return res.send({resultcode: 100, message: 'Ошибка создания поста на сервере'})
        }
    }

    async getPosts(req, res) {
        try {
            await UserModel.findById(req.user).exec((err, user) => {
                if (!user) {
                    return res.json({resultcode: 101, message: 'Пользователь не найден'})
                }
                return res.status(200).json({resultcode: 200, posts: user.posts})
            })
        } catch (error) {
            console.log('ошибка получения постов')
            res.send({resultcode: 100, message: 'Ошибка получения данных на сервере'})
        }
    }

    async uploadAvatar(req, res) {
        try {
            const file = req.files?.file
            if (file) {
                const type = file.mimetype
                const user = await UserModel.findById(req.user)
                const isAvatar = fs.existsSync(pathAvatar(user.avatar))
                if (isAvatar) {
                    fs.unlinkSync(pathAvatar(user.avatar))
                }
                user.avatar = nanoid(3) + `.${type.split('/')[1]}`
                file.mv(pathAvatar(user.avatar))
                await user.save()
                return res.json({message: 'Успешная загрузка', avatar: user.avatar})
            }
        } catch (error) {
            console.log('ошибка загрузки аватарки')
            return res.json({message: 'Ошибка загрузки аватарки на сервере'})
        }
    }

    async deleteAvatar(req, res) {
        try {
            const user = await UserModel.findById(req.user)
            fs.unlinkSync(pathAvatar(user.avatar))
            user.avatar = null
            await user.save()
            return res.json({message: 'Аватар успешно удалён'})
        } catch (error) {
            console.log('ошибка удаления аватарки')
            return res.json({message: 'Ошибка удаления аватарки на сервере'})
        }
    }
}

module.exports = new ProfileController()

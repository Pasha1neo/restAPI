const User = require('../model/user')
const Post = require('../model/post')
const {nanoid} = require('nanoid')
const fs = require('fs')

const time = () => {
    const data = new Date().toLocaleString('ru-RU')
    const data1 = data.split(',')
    return {data: data1[0], time: data1[1].slice(1, 6)}
}

function pathAvatar(name) {
    return `${__dirname}\\..\\static\\${name}`
}

class ProfileController {
    async createPost(req, res) {
        try {
            const {text} = req.body
            const user = await User.findById(req.user, 'posts')
            if (!user) return res.send(false)
            const post = await Post.create({text, fid: req.user, ...time()})
            user.posts.push(post._id)
            await user.save()
            return res.send(post)
        } catch (error) {
            console.log('controllers/profile/createPost')
            return res.send(false)
        }
    }

    async setNickname(req, res) {
        try {
            const {nickname} = req.body
            const user = await User.findById(req.user, 'nickname')
            if (!user) return res.send(false)
            user.nickname = nickname
            await user.save()
            return res.send(nickname)
        } catch (error) {
            console.log('controllers/profile/setNickname')
            return res.send(false)
        }
    }

    async uploadAvatar(req, res) {
        try {
            const file = req.files?.file
            if (!file) return res.send(false)
            const type = file.mimetype
            const user = await User.findById(req.user, 'avatar')
            const isAvatar = fs.existsSync(pathAvatar(user.avatar))
            if (isAvatar) fs.unlinkSync(pathAvatar(user.avatar))
            const avatar = (user.avatar = nanoid(4) + `.${type.split('/')[1]}`)
            await file.mv(pathAvatar(avatar))
            await user.save()
            return res.send(avatar)
        } catch (error) {
            console.log('controllers/profile/uploadAvatar')
            return res.send(false)
        }
    }

    async getPosts(req, res) {
        try {
            await User.findById(req.user)
            if (!user) return res.json(false)
            return res.json(false)
        } catch (error) {
            console.log('ошибка получения постов')
            res.send({resultcode: 100, message: 'Ошибка получения данных на сервере'})
        }
    }

    async deleteAvatar(req, res) {
        try {
            const user = await User.findById(req.user)
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

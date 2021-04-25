const fs = require('fs')
const UserModel = require('../model/User')
const {nanoid} = require('nanoid')
function pathAvatar(name) {
    return `${__dirname}\\..\\static\\${name}`
}
class FileController {
    async uploadAvatar(req, res) {
        try {
            const file = req.files?.file
            if (file) {
                const type = req.files.file.mimetype
                const user = await UserModel.findById(req.user.id)
                const isAvatar = fs.existsSync(pathAvatar(user.avatar))
                if (isAvatar) {
                    fs.unlinkSync(pathAvatar(user.avatar))
                }
                user.avatar = nanoid(3) + `.${type.split('/')[1]}`
                file.mv(pathAvatar(user.avatar))
                await user.save()
                return res.json({message: 'Успешная загрузка', payload: user.avatar})
            }
        } catch (error) {
            console.log(error)
            return res.json({message: 'Ошибка загрузки аватарки на сервере'})
        }
    }
    async deleteAvatar(req, res) {
        try {
            const user = await UserModel.findById(req.user.id)
            fs.unlinkSync(pathAvatar(user.avatar))
            user.avatar = null
            await user.save()
            return res.json({message: 'Аватар успешно удалён'})
        } catch (error) {
            return res.json({message: 'Ошибка удаления аватарки на сервере'})
        }
    }
}

module.exports = new FileController()

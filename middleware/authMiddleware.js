const jwt = require('jsonwebtoken')
const SECRETKEY = 'pasha1neo'

module.exports = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next()
    }
    try {
        const userId = req.headers.authorization.split(' ')[1]

        if (!userId) {
            return res
                .status(200)
                .json({resultcode: 101, message: 'Необходимо авторизироваться снова'})
        }
        const decodedUserId = jwt.verify(userId, SECRETKEY)
        req.user = {id: decodedUserId.id}
        next()
    } catch (error) {
        return res.status(200).json({resultcode: 100, message: 'Ошибка авторизации на сервере'})
    }
}

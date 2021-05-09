// const User = require('../model/user')
// const Token = require('../model/token')
// const {verifyToken} = require('../services/refresh')
// const {refresh} = require('../services/refresh')

// module.exports.authenticate = async function auth(req, res) {
//     try {
//         const user = await User.findById(req.user)
//         if (!user) {
//             res.json({
//                 resultcode: 101,
//             })
//         }
//         res.json({
//             resultcode: 200,
//             user: {
//                 id: user._id,
//                 login: user.login,
//                 email: user.email,
//                 nickname: user?.nickname,
//                 posts: user?.posts,
//                 avatar: user?.avatar,
//             },
//         })
//     } catch (error) {
//         console.log(req.user)
//         res.send({resultcode: 100, message: 'Ошибка контроллера аутентификации на сервере'})
//     }
// }

// module.exports.refreshToken = async function refreshToken(err, req, res, next) {
//     try {
//         const {token} = req.cookies?.user
//         const vToken = verifyToken(token)
//         if (vToken) {
//             const {userId} = await Token.findOne({tokenId: vToken})
//             const tokens = refresh(userId)
//             return res.status(200).send({resultcode: 101, tokens})
//         }
//         return res.status(200).send({resultcode: 101, message: 'Перезайдите заново'})
//     } catch (error) {
//         return res.status(401).send({resultcode: 401, message: 'Ты или украл ключ или дурак'})
//     }
// }

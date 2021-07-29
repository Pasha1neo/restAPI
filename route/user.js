const user = require('../controller/user')
const {Router} = require('express')
const router = Router()
const passport = require('passport')

router.post('/friend/add', passport.authenticate('jwt', {session: false}), user.addAsFriends)
router.post(
    '/friend/remove',
    passport.authenticate('jwt', {session: false}),
    user.removeFromFriends
)
router.get('/friends', passport.authenticate('jwt', {session: false}), user.getFriends)

module.exports = router

const profile = require('../controller/profile')
const {Router} = require('express')
const router = Router()
const passport = require('passport')

router.post('/nickname', passport.authenticate('jwt', {session: false}), profile.setNickname)
router.post('/', profile.getPosts)
router.post('/create', passport.authenticate('jwt', {session: false}), profile.createPost)
router.post('/avatar', passport.authenticate('jwt', {session: false}), profile.uploadAvatar)
router.delete('/avatar', passport.authenticate('jwt', {session: false}), profile.deleteAvatar)

module.exports = router

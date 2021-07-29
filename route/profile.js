const profile = require('../controller/profile')
const {Router} = require('express')
const router = Router()
const passport = require('passport')

router.post('/nickname', passport.authenticate('jwt', {session: false}), profile.setNickname)
router.get('/:userId?', profile.getProfile)
router.get('/users/get', profile.getUsers)
router.post('/post/create', passport.authenticate('jwt', {session: false}), profile.createPost)
router.post('/post/delete', passport.authenticate('jwt', {session: false}), profile.deletePost)
router.post('/avatar/upload', passport.authenticate('jwt', {session: false}), profile.uploadAvatar)
router.post('/avatar/delete', passport.authenticate('jwt', {session: false}), profile.deleteAvatar)

module.exports = router

const sign = require('../controller/sign')
const token = require('../controller/token')
const passport = require('passport')
const {Router} = require('express')
const router = Router()

router.post('/signup', sign.SignUp)
router.post('/signin', passport.authenticate('local', {session: false}), sign.SignIn)
router.get('/refresh', token.refresh)
router.get('/', passport.authenticate('jwt', {session: false}), sign.Auth)
module.exports = router

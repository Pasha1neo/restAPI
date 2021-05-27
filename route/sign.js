const sign = require('../controller/sign')
const token = require('../controller/token')
const passport = require('passport')
const {Router} = require('express')
const router = Router()

router.post('/up', sign.up)
router.post('/in', passport.authenticate('local', {session: false}), sign.in)
router.get('/out', sign.out)
router.get('/refresh', token.refresh)
router.get('/', passport.authenticate('jwt', {session: false}), sign.auth)
module.exports = router

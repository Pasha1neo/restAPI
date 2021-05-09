const user = require('../controller/users')
const passport = require('passport')
const {Router} = require('express')
const router = Router()

router.get('/', user.getUsers)

module.exports = router

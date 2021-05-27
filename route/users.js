const user = require('../controller/users')
const {Router} = require('express')
const router = Router()

router.get('/', user.getUsers)

module.exports = router

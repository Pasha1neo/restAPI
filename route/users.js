const express = require('express')
const UsersController = require('../controller/usersController')
const authMiddleware = require('../middleware/authMiddleware')
const router = express.Router()

router.get('/', UsersController.setNickname)

module.exports = router

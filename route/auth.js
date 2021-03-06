const express = require('express')
const router = express.Router()

const AuthController = require('../controller/authController')
const AuthMiddleware = require('../middleware/authMiddleware')

router.post('/signup', AuthController.SignUp)
router.post('/signin', AuthController.SignIn)
router.get('/', AuthMiddleware, AuthController.Auth)

module.exports = router

const express = require('express')
const profileController = require('../controller/profileController')
const authMiddleware = require('../middleware/authMiddleware')
const router = express.Router()

router.post('/nickname', authMiddleware, profileController.setNickname)
router.post('/', authMiddleware, profileController.getPosts)
router.post('/create', authMiddleware, profileController.createPost)
router.post('/avatar', authMiddleware, profileController.uploadAvatar)
router.delete('/avatar', authMiddleware, profileController.deleteAvatar)

module.exports = router

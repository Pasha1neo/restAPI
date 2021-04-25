const express = require('express')
const fileController = require('../controller/fileController')
const authMiddleware = require('../middleware/authMiddleware')
const router = express.Router()

router.post('/avatar', authMiddleware, fileController.uploadAvatar)
router.delete('/avatar', authMiddleware, fileController.deleteAvatar)
module.exports = router

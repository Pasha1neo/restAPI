const express = require('express')
const router = express.Router()

const postController = require('../controller/postController')

router.post('/add', postController.create)
router.post('/', postController.get)

module.exports = router

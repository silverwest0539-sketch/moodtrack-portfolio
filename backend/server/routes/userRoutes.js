const express = require('express')
const router = express.Router()
const userController = require('../../controllers/userController')

// 사용자 프로필 조회
router.get('/profile', userController.getUserProfile)

module.exports = router;
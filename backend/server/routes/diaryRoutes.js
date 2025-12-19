const express = require('express')
const router = express.Router()
const diaryController = require('../../controllers/diaryController')

// 일기 감정 분석
router. post('/analyze', diaryController.analyzeDiary)

module.exports = router;
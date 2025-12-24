const express = require('express')
const router = express.Router()
const diaryController = require('../../controllers/diaryController')

// 일기 감정 분석
router. post('/analyze', diaryController.analyzeDiary)

// 주간 일기 조회
router.get('/weekly', diaryController.getWeeklyDiary)

// 날짜 선택 시 일기 조회
router.get('/', diaryController.getDiaryByDate)

// 일기 수정
router.put('/', diaryController.updateDiary)

module.exports = router;
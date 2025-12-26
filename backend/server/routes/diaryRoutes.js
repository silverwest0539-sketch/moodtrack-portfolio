const express = require('express')
const router = express.Router()
const diaryController = require('../../controllers/diaryController')

// 일기 감정 분석
router.post('/analyze', diaryController.analyzeDiary)

// 주간 일기 조회
router.get('/weekly', diaryController.getWeeklyDiary)

// 어제 일기 조회
router.get('/yesterday', diaryController.getYesterdayDiary)

// 날짜별 일기 조회(WeeklyStats)
router.get('/result', diaryController.getDiaryForResult)

// 날짜별 일기 조회(DiaryViewer)
router.get('/date', diaryController.getDiaryByDate)

// 일기 수정
router.put('/', diaryController.updateDiary)



module.exports = router;
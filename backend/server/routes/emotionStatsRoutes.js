const express = require('express')
const router = express.Router()

const {
    getWeeklyEmotionStats,
    getMonthlyEmotionStats,
    getYearlyEmotionStats,
    getWeekFullData,
} = require('../../controllers/emotionStatsController')

// 주간 감정 통계
router.get('/weekly', getWeeklyEmotionStats)

// 월간 감정 통계
router.get('/monthly', getMonthlyEmotionStats)

// 연간 감정 통계
router.get('/yearly', getYearlyEmotionStats)

// 이번 주 전체 데이터 (HomeWeekly용)
router.get('/week-full', getWeekFullData)

module.exports = router;
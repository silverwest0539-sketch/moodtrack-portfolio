const express = require('express')
const router = express.Router()

const {
    getWeeklyEmotionStats,
    getMonthlyEmotionStats,
    getYearlyEmotionStats,
} = require('../../controllers/emotionStatsController')

// 주간 감정 통계
router.get('/weekly', getWeeklyEmotionStats)

// 월간 감정 통계
router.get('/monthly', getMonthlyEmotionStats)

// 연간 감정 통계
router.get('/yearly', getYearlyEmotionStats)

module.exports = router;
const express = require('express')
const router = express.Router()

const {
    getWeeklyEmotionStats,
    getMonthlyEmotionStats,
    getYearlyEmotionStats,
    getWeekFullData,
    getWeekDetailStats,
    getMonthDetailStats,
} = require('../../controllers/emotionStatsController')

// 주간 감정 통계
router.get('/weekly', getWeeklyEmotionStats)

// 월간 감정 통계
router.get('/monthly', getMonthlyEmotionStats)

// 주차별 상세 통계
router.get('/week-detail', getWeekDetailStats)

// 연간 감정 통계
router.get('/yearly', getYearlyEmotionStats)

// 월별 상세 통계
router.get('/month-detail', getMonthDetailStats)

// 이번 주 전체 데이터 (HomeWeekly용)
router.get('/week-full', getWeekFullData)

module.exports = router;
// controllers/emotionStatsController.js

const pool = require('../server/config/database')

// 이번 주 월요일~일요일 구하기
const getThisWeekRange = () => {
    const now = new Date()
    const day = now.getDay()

    const diffToMonday = day === 0 ? -6 : 1 - day

    const monday = new Date(now)
    monday.setDate(now.getDate() + diffToMonday)
    monday.setHours(0, 0, 0, 0)

    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    sunday.setHours(23, 59, 59, 999)

    return { monday, sunday }
}

// 이번 달 1일~말일 구하기
const getThisMonthRange = () => {
    const now = new Date()

    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    firstDay.setHours(0, 0, 0, 0)

    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    lastDay.setHours(23, 59, 9, 999)

    return { firstDay, lastDay }
}

// 올해 1월 1일~12월31일 구하기
const getThisYearRange = () => {
    const now = new Date()
    const year = now.getFullYear()

    const firstDay = new Date(year, 0, 1)
    firstDay.setHours(0, 0, 0, 0)

    const lastDay = new Date(year, 11, 31)
    lastDay.setHours(23, 59, 59, 999)

    return { year, firstDay, lastDay }
}
const getWeekdayIndex = (date) => {
    const day = date.getDay()
    return day === 0 ? 6 : day - 1
}

const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate()
}

// HomeWeekly용 이번 주 전체 데이터
exports.getWeekFullData = async (req, res) => {
    try {
        
        if (!req.session || !req.session.user || !req.session.user.userId) {
            return res.status(401).json({
                success: false,
                message: '세션이 준비되지 않았습니다.'
            });
        }

        const userId = req.session.user.userId

        const now = new Date()

        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 6);
        weekAgo.setHours(0, 0, 0, 0);

        const today = new Date(now);
        today.setHours(23, 59, 59, 999);

        const [rows] = await pool.query(
            `
            SELECT DIARY_DATE, EMO_SCORE
              FROM DIARY
             WHERE USER_ID = ?
               AND DIARY_DATE BETWEEN ? AND ?
            `,
            [userId, weekAgo, today]
        )

        const diaryMap = {};
        rows.forEach((row) => {
            const date = new Date(row.DIARY_DATE);
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            const dateKey = `${yyyy}-${mm}-${dd}`;

            diaryMap[dateKey] = row.EMO_SCORE;
        });

        const diaries = []
        for (let i = 6; i >= 0; i--) {
            const currentDate = new Date(now)
            currentDate.setDate(now.getDate() - i)

            const yyyy = currentDate.getFullYear()
            const mm = String(currentDate.getMonth() + 1).padStart(2, '0')
            const dd = String(currentDate.getDate()).padStart(2, '0')
            const dateKey = `${yyyy}-${mm}-${dd}`

            diaries.push({
                DIARY_DATE: dateKey,
                EMO_SCORE: diaryMap[dateKey] || null,
                DAY_INDEX: currentDate.getDay()
            })
        }

        return res.json({
            success: true,
            diaries: diaries
        })
    } catch (error) {
        console.error('주간 전체 데이터 조회 실패:', error)
        return res.status(500).json({
            success: false,
            message: '주간 전체 데이터 조회 실패',
        })
    }
}

exports.getWeeklyEmotionStats = async (req, res) => {
    try {

        const userId = req.session.user.userId;
        const { monday, sunday } = getThisWeekRange()

        const scores = [0, 0, 0, 0, 0, 0, 0]

        const [rows] = await pool.query(
            `
            SELECT DIARY_DATE, EMO_SCORE
              FROM DIARY
             WHERE USER_ID = ?
               AND DIARY_DATE BETWEEN ? AND ?
            `,
            [userId, monday, sunday]
        )

        rows.forEach((row) => {
            const date = new Date(row.DIARY_DATE)
            const index = getWeekdayIndex(date)
            scores[index] = row.EMO_SCORE
        })

        return res.json({
            success: true,
            weekly: {
                labels: ['월', '화', '수', '목', '금', '토', '일'],
                scores,
            },
        })
    } catch (error) {
        console.error('주간 감정 통계 실패:', error)
        return res.status(500).json({
            success: false,
            message: '주간 감정 통계 조회 실패',
        })
    }
}

exports.getMonthlyEmotionStats = async (req, res) => {
    try {
        const userId = req.session.user.userId

        const { firstDay, lastDay } = getThisMonthRange()
        const year = firstDay.getFullYear()
        const month = firstDay.getMonth()

        const daysInMonth = getDaysInMonth(year, month)

        const labels = Array.from(
            { length: daysInMonth },
            (_, i) => `${i + 1}일`
        )
        const scores = Array(daysInMonth).fill(0)

        const [rows] = await pool.query(
            `
            SELECT DIARY_DATE, EMO_SCORE
              FROM DIARY
             WHERE USER_ID = ?
               AND DIARY_DATE BETWEEN ? AND ?
            `,
            [userId, firstDay, lastDay]
        )

        rows.forEach((row) => {
            const date = new Date(row.DIARY_DATE)
            const day = date.getDate()
            scores[day - 1] = row.EMO_SCORE
        })

        return res.json({
            success: true,
            monthly: {
                labels,
                scores,
            },
        })
    } catch (error) {
        console.error('월간 감정 통계 실패:', error)
        return res.status(500).json({
            success: false,
            message: '월간 감정 통계 조회 실패'
        })
    }
}

exports.getYearlyEmotionStats = async (req, res) => {
    try {
        const userId = req.session.user.userId

        const { year, firstDay, lastDay } = getThisYearRange()

        const labels = Array.from(
            { length: 12 },
            (_, i) => `${i + 1}월`
        )
        const scores = Array(12).fill(0)

        const [rows] = await pool.query(
            `
            SELECT 
              MONTH(DIARY_DATE) AS month,
              AVG(EMO_SCORE) AS avg_score
              FROM DIARY
             WHERE USER_ID = ?
               AND DIARY_DATE BETWEEN ? AND ?
             GROUP BY MONTH(DIARY_DATE)
            `,
            [userId, firstDay, lastDay]
        )

        rows.forEach(row => {
            const monthIndex = row.month - 1
            scores[monthIndex] = Math.round(row.avg_score)
        })

        return res.json({
            success: true,
            yearly: {
                year,
                labels,
                scores,
            }
        })
    } catch (error) {
        console.error('연간 감정 통계 실패:', error)
        return res.status(500).json({
            success: false,
            message: '연간 감정 통계 조회 실패',
        })
    }
}
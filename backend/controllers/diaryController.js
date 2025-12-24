// controllers/diaryController.js
// 일기 관련 컨트롤러

const emotionController = require('./emotionController')
const pool = require('../server/config/database')

// 일기 감정 분석
exports.analyzeDiary = async (req, res) => {
    try {
        const userId = req.session.user.userId;
        const { content, diaryDate } = req.body;

        // 유효성 검사
        if (!content || content.trim() === '') {
            return res.status(400).json({
                success: false,
                message: '일기 내용을 입력해주세요.'
            })
        }

        if (!content || content.trim().length < 50) {
            return res.status(400).json({
                success: false,
                message: '일기는 최소 50자 이상이어야 합니다.'
            })
        }

        console.log('감정 분석 요청')

        // 날짜 변환
        const parseDate = diaryDate.replace(/\.\s/g, '-')

        // 감정 분석 실행
        const emotionResult = await emotionController.getEmotionScore(content)

        console.log(`감정 점수: ${emotionResult.finalScore}점`)

        // 기존 일기 존재 여부 확인
        const [existing] = await pool.query(
            `
            SELECT 1 FROM DIARY
             WHERE USER_ID = ? AND DIARY_DATE = ?
            `,
            [userId, parseDate]
        )

        if (existing.length > 0) {
            await pool.query(
                `
                UPDATE DIARY
                   SET CONTENT = ?, EMO_SCORE = ?
                 WHERE USER_ID = ? AND DIARY_DATE = ?
                `,
                [content, emotionResult.finalScore, userId, parseDate]
            )
        } else {
            await pool.query(
                `
            INSERT INTO DIARY (USER_ID, DIARY_DATE, CONTENT, EMO_SCORE)
            VALUES (?, ?, ?, ?)
            `,
                [
                    userId,
                    parseDate,
                    content,
                    emotionResult.finalScore
                ]
            )
        }

        return res.status(200).json({
            success: true,
            finalScore: emotionResult.finalScore,
            emotionScores: emotionResult.emotionScores
        })
    } catch (error) {
        console.error('감성분석 실패:', error)

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: '해당 날짜의 일기는 이미 존재합니다.'
            })
        }

        return res.status(500).json({
            success: false,
            message: '감정 분석에 실패했습니다.'
        })
    }
}

exports.getWeeklyDiary = async (req, res) => {
    try {
        const userId = req.session.user.userId

        const [rows] = await pool.query(
            `
            SELECT DIARY_DATE, EMO_SCORE
              FROM DIARY
             WHERE USER_ID = ?
               AND DIARY_DATE BETWEEN DATE_SUB(CURDATE(), INTERVAL 4 DAY) AND CURDATE()
            `,
            [userId]
        )

        return res.json({
            success: true,
            diaries: rows
        })
    } catch (error) {
        console.log('주간 일기 조회 실패:', error)
        return res.status(500).json({
            success: false,
            message: '주간 일기 조회 실패'
        })
    }
}

// 일기 조회
exports.getDiaryByDate = async (req, res) => {
    try {
        const { date } = req.query
        const userId = req.session.user.userId

        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'date 파라미터 없음'
            })
        }

        const [rows] = await pool.query(
            `
        SELECT CONTENT, EMO_SCORE
        FROM DIARY
        WHERE USER_ID = ? AND DIARY_DATE = ?
        `,
            [userId, date]
        )

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: '일기 없음'
            })
        }

        const score = rows[0].EMO_SCORE

        return res.json({
            success: true,
            diary: {
                content: rows[0].CONTENT,
                score,
                emotionEmoji:
                    score >= 70 ? '😊'
                        : score >= 40 ? '😐'
                            : '☁️'
            }
        })
    } catch (error) {
        console.error('일기 조회 실패:', error)
        return res.status(500).json({
            success: false,
            message: '일기 조회 실패'
        })
    }
}

// 일기 수정
exports.updateDiary = async (req, res) => {
    try {
        const userId = req.session.user.userId
        const { date, content } = req.body

        if (!date || !content || content.trim() === '') {
            return res.status(400).json({
                success: false,
                message: '내용이 비어있습니다.'
            })
        }

        const emotionResult = await emotionController.getEmotionScore(content)

        await pool.query(
            `
            UPDATE DIARY
               SET CONTENT = ?, EMO_SCORE = ?
             WHERE USER_ID = ? AND DIARY_DATE = ?
            `,
            [content, emotionResult.finalScore, userId, date]
        )

        return res.json({
            success: true,
            finalScore: emotionResult.finalScore,
            emotionScores: emotionResult.emotionScores
        })

    } catch (err) {
        console.error('일기 수정 실패:', err)
        return res.status(500).json({
            success: false,
            message: '일기 수정 실패'
        })
    }
}
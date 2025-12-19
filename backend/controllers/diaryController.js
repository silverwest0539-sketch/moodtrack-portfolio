// controllers/diaryController.js
// 일기 관련 컨트롤러

const emotionController = require('./emotionController')

// 일기 감정 분석
exports.analyzeDiary = async (req, res)=>{
    try {
        const { content } = req.body;

        // 유효성 검사
        if (!content || content.trim() === '') {
            return res.status(400).json({
                success: false,
                message: '일기 내용을 입력해주세요.'
            })
        }

        console.log('감정 분석 요청')

        // 감정 분석 실행
        const emotionResult = await emotionController.getEmotionScore(content)

        console.log(`감정 점수: ${emotionResult.finalScore}점`)

        // 점수 응답
        return res.status(200).json({
            success: true,
            finalScore: emotionResult.finalScore,
            emotionScores: emotionResult.emotionScores
        })
    } catch (error) {
        console.error('감정 분석 실패:', error)
        return res.status(500).json({
            success: false,
            message: error.message || '감정 분석에 실패했습니다.'
        })
    }
}
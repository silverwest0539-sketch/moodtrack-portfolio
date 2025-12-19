// Flask API와 통신하는 감정 분석 컨트롤러

const axios = require('axios');

const FLASK_API_URL = 'http://localhost:5000';

// Flask API 호출 함수
async function getEmotionScore(content) {
    try {
        const response = await axios.post(`${FLASK_API_URL}/analyze`, {
            content: content
        }, {
            timeout: 30000
        })

        return {
            success: true,
            emotionScores: response.data.emotion_scores,
            finalScore: response.data.final_score
        }
    } catch (error) {
        console.error('감정 분석 실패:', error.message)

        if (error.code === 'ECONNREFUSED') {
            throw new Error('Flask 서버가 실행되지 않았습니다.')
        }

        throw new Error('감정 분석 중 오류가 발생했습니다.')
    }
}

module.exports = {
    getEmotionScore
};
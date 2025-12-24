// controllers/diaryController.js
// 일기 관련 컨트롤러

const emotionController = require('./emotionController')
const pool = require('../server/config/database')
const recentByUser = new Map();

// 일기 감정 분석
exports.analyzeDiary = async (req, res) => {
    try {
        const { userId } = req.session.user;
        const { content, diaryDate } = req.body;

        // 유효성 검사
        if (!content || content.trim() === '') {
            return res.status(400).json({
                success: false,
                message: '일기 내용을 입력해주세요.'
            })
        }

        console.log('감정 분석 요청')

        // 날짜 변환
        const parseDate = diaryDate.replace(/\.\s/g, '-')

        // 감정 분석 실행
        const emotionResult = await emotionController.getEmotionScore(content)
        const finalScore = Number(emotionResult.finalScore) || 0;

        console.log(`감정 점수: ${finalScore}점`)

        // 조합 유틸
        const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
        const clampScore = (v) => Math.max(0, Math.min(100, Number(v) || 0));

        // (선택) 유저별 직전 코멘트 중복 방지 (서버 재시작하면 초기화)
        const lastCommentByUser = global.__lastCommentByUser || new Map();
        global.__lastCommentByUser = lastCommentByUser;

        const score = clampScore(finalScore);

        // 점수 구간 결정
        let band = 'mid';
        if (score <= 19) band = 'low';
        else if (score <= 39) band = 'midLow';
        else if (score <= 59) band = 'mid';
        else if (score <= 79) band = 'midHigh';
        else band = 'high';

        // 구간별 문장 조각(메인/팁/마무리)
        const parts = {
        low: {
            main: [
            '오늘은 마음이 많이 지쳐 보이네요.',
            '지금은 에너지가 바닥 쪽인 느낌이에요.',
            '오늘은 감정 온도가 꽤 낮게 나왔어요.',
            '마음이 무거운 날로 보이네요.'
            ],
            tip: [
            '오늘 할 일은 “최소”로만 잡아도 괜찮아요.',
            '물 한 컵 마시고 3분만 숨 고르는 시간부터 가져요.',
            '지금은 해결보다 회복이 먼저예요.',
            '잠깐이라도 몸을 풀어주면 생각이 덜 꼬여요.'
            ],
            closing: [
            '버티는 것만 해도 충분히 잘하고 계세요.',
            '오늘은 쉬어도 됩니다. 진짜로요.',
            '지금의 나를 너무 몰아붙이지 말아요.'
            ]
        },

        midLow: {
            main: [
            '오늘은 컨디션이 애매한 날 같아요.',
            '마음이 살짝 무거운 편이에요.',
            '기분이 조금 내려앉아 있는 느낌이네요.',
            '에너지가 들쭉날쭉할 수 있는 날이에요.'
            ],
            tip: [
            '큰 결정은 미루고, 작은 성취 하나만 챙겨봐요.',
            '우선순위 1개만 정하고 나머지는 과감히 내려놔요.',
            '짧은 산책이나 샤워 같은 리셋 루틴이 도움이 돼요.',
            '오늘은 “완벽” 말고 “완료”만 목표로 잡아도 좋아요.'
            ],
            closing: [
            '여기까지 온 것만으로도 충분히 수고하셨어요.',
            '내일의 내가 고마워할 정도로만 해도 성공이에요.',
            '오늘은 페이스 조절이 정답입니다.'
            ]
        },

        mid: {
            main: [
            '오늘은 무난-보통 느낌이에요.',
            '감정이 크게 요동치진 않네요.',
            '전체적으로 안정적인 흐름이에요.',
            '평온한 편이라 리듬 유지가 좋아 보여요.'
            ],
            tip: [
            '루틴 하나만 지켜도 내일이 확 편해져요.',
            '책상 정리 3분 같은 “작은 정리”가 은근 기분 올려줘요.',
            '오늘 잘한 일 한 가지를 적어두면 멘탈이 단단해져요.',
            '너무 무리만 안 하면 오늘은 충분히 좋은 날이에요.'
            ],
            closing: [
            '이 정도면 꽤 괜찮은 하루예요.',
            '지금 흐름 유지하면 됩니다.',
            '무난함이 사실 제일 강력한 안정이죠.'
            ]
        },

        midHigh: {
            main: [
            '오늘 마음 상태 꽤 좋아요.',
            '기분이 안정적이고 단단해 보여요.',
            '좋은 흐름을 타고 있는 느낌이에요.',
            '컨디션이 꽤 괜찮게 나왔어요.'
            ],
            tip: [
            '미뤄둔 거 하나만 끝내면 성취감이 확 올라가요.',
            '내일을 위해 준비 하나만 해두면 완전 꿀이에요.',
            '좋았던 포인트를 한 줄로 남기면 재현하기 쉬워요.',
            '이 템포로만 가도 충분히 잘하고 있어요.'
            ],
            closing: [
            '오늘의 나, 칭찬 한 번 해주고 가시죠.',
            '이 페이스 유지하면 진짜 좋습니다.',
            '지금 리듬 계속 가져가요 😎'
            ]
        },

        high: {
            main: [
            '와 오늘은 마음 온도 거의 만점이에요.',
            '오늘 에너지 진짜 좋게 나왔어요.',
            '컨디션이 최고치에 가까워 보여요.',
            '기분이 엄청 밝은 쪽으로 기울어 있네요.'
            ],
            tip: [
            '하고 싶던 거 하나 딱 처리하면 오늘이 레전드 됩니다.',
            '좋은 날일수록 수면/식사만 지키면 완벽해요.',
            '이 기분이 왜 왔는지 한 줄로 적어두면 다음에도 꺼내 쓸 수 있어요.',
            '오늘은 주변에도 좋은 영향 뿌리고 다니셨겠는데요?'
            ],
            closing: [
            '이런 날은 저장각이에요. 진짜로요.',
            '좋은 흐름 제대로 탔습니다 🔥',
            '오늘의 기분 오래 가게 마무리만 깔끔하게!'
            ]
        }
        };

        // 조합 생성
        let comment = `${pick(parts[band].main)} ${pick(parts[band].tip)} ${pick(parts[band].closing)}`;

        // (선택) 직전 코멘트와 완전 동일하면 한 번 더 생성
        const prev = lastCommentByUser.get(userId);
        if (prev && prev === comment) {
        comment = `${pick(parts[band].main)} ${pick(parts[band].tip)} ${pick(parts[band].closing)}`;
        }
        lastCommentByUser.set(userId, comment);

        // DB 저장
        const [result] = await pool.query(
            `
            INSERT INTO DIARY (USER_ID, DIARY_DATE, CONTENT, EMO_SCORE, COMMENT_TEXT)
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                userId,
                parseDate,
                content,
                finalScore,
                comment
            ]
        )

        // 응답
        return res.status(200).json({
        success: true,
        finalScore,
        emotionScores: emotionResult.emotionScores,
        comment
        });


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
        const user = req.session.user;

        if (!user) {
            return res.status(401).json({
                success: false,
                message: '로그인이 필요합니다.'
            });
        }

        const userId = user.userId;
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
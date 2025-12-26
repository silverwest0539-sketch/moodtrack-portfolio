// controllers/diaryController.js
// 일기 관련 컨트롤러

const emotionController = require('./emotionController')
const pool = require('../server/config/database')

// 코멘트 생성 함수
const generateComment = (finalScore, userId, nickname) => {

    if (!nickname || !nickname.trim()) {
        throw new Error('nickname is required for generateComment');
    }
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const clampScore = (v) => Math.max(0, Math.min(100, Number(v) || 0));

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

    // 구간별 문장 조각
    const parts = {
        low: {
            main: [
            '{nickname}님, 오늘은 마음이 많이 지쳐 보이네요.',
            '지금은 에너지가 바닥 쪽인 느낌이에요.',
            '{nickname}님 오늘은 감정 온도가 꽤 낮게 나왔어요.',
            '마음이 무거운 날로 보이네요.',
            '오늘은 마음이 꽤 무거운 쪽으로 기울어 있네요.',
            '{nickname}님, 감정 에너지가 많이 새는 날처럼 보여요.',
            '지금은 버티는 것만으로도 난이도 높은 하루예요.',
            '오늘은 마음이 쉽게 지칠 수 있는 상태 같아요.',
            '{nickname}님, 생각이 많아지고 숨이 짧아지는 날일 수 있어요.',
            '내 마음이 “잠깐 멈춰”라고 말하는 것 같네요.',
            '지금은 속도가 아니라 안전이 중요한 타이밍이에요.',
            '{nickname}님, 오늘은 그냥… 힘든 날로 인정해도 됩니다.',
            '마음의 배터리가 1% 느낌… 충전이 필요해요.',
            '오늘은 감정이 땅쪽으로 끌리는 날이에요.',
            '{nickname}님, 오늘은 마음이 예민하게 반응하는 날일 수 있어요.',
            '괜히 모든 게 버겁게 느껴질 수 있는 날이에요.',
            '오늘은 감정이 쉽게 가라앉는 흐름이에요.',
            '{nickname}님, 내가 나를 달래줘야 하는 날 같아요.',
            '오늘은 마음이 “휴식”을 강하게 요구하는 날이에요.',
            '마음이 무겁고 몸도 같이 처질 수 있는 날이에요.'
            ],
            tip: [
            '{nickname}님, 오늘 할 일은 "최소"로만 잡아도 괜찮아요.',
            '물 한 컵 마시고 3분만 숨 고르는 시간부터 가져요.',
            '지금은 해결보다 회복이 먼저예요.',
            '{nickname}님, 잠깐이라도 몸을 풀어주면 생각이 덜 꼬여요.',
            '한 번에 다 해결하려고 하지 말고, “지금 당장 할 수 있는 1개”만 잡아요.',
            '{nickname}님께는 따뜻한 물/차 한 잔이 생각보다 효과가 있을 수 있어요.',
            '침대에 눕기 전에 어깨 힘부터 풀어줘요. 진짜로요.',
            '{nickname}님, 지금은 “잘하기”보다 “안 망하기”가 목표여도 됩니다.',
            '휴대폰 내려두고 눈 감고 10번만 천천히 호흡해봐요.',
            '{nickname}님, 오늘은 나를 혼내는 말 금지. 규칙입니다.',
            '가능하면 햇빛 5분이라도 쐬어줘요. 기분이 덜 가라앉아요.',
            '{nickname}님, 배가 비어 있으면 감정도 더 가라앉아요. 간단히라도 챙겨요.',
            '지금은 생산성 말고 생존성… 우선 몸부터 챙기기!',
            '{nickname}님, 할 일 목록을 줄이는 것도 “실력”이에요.',
            '오늘은 “해야 한다” 대신 “하면 좋다”로 바꿔보세요.',
            '{nickname}님, 눈앞의 일부터 5분만 쪼개서 시작해봐요.',
            '집안 조명 조금 밝히는 것도 은근 분위기 바꿔줘요.',
            '{nickname}님, 정리하려고 애쓰지 말고, 일단 쉬는 게 정답일 수 있어요.',
            '가능하면 오늘은 자극적인 콘텐츠는 살짝 멀리해요.',
            '{nickname}님, 기분이 너무 내려가면 일단 몸을 따뜻하게 해주세요.'
            ],
            closing: [
            '{nickname}님, 버티는 것만 해도 충분히 잘하고 계세요.',
            '오늘은 쉬어도 됩니다. 진짜로요.',
            '{nickname}님, 지금의 나를 너무 몰아붙이지 말아요.',
            '지금까지 버틴 것도 대단한 거예요.',
            '오늘의 {nickname}님은 보호받아야 합니다.',
            '{nickname}님, 내일의 내가 오늘의 나를 이해해줄 거예요.',
            '괜찮지 않아도 괜찮습니다.',
            '{nickname}님, 오늘은 “여기까지”가 승리예요.',
            '지금의 나를 미워하지 말아줘요.',
            '{nickname}님, 오늘은 잠깐 내려놓고, 다시 올라도 돼요.',
            '오늘 하루, 생존 완료. 이거면 됐어요.',
            '{nickname}님, 힘든 날엔 기준을 낮추는 게 맞아요.',
            '{nickname}님은 지금도 충분히 하고 있어요.',
            '오늘은 “아무것도 안 망친 것”만으로도 잘한 거예요.',
            '{nickname}님, 내 마음이 힘들다는 걸 알아챈 것부터 이미 큰일 했어요.',
            '오늘은 완벽 말고 안전이 우선이에요.',
            '{nickname}님, 지금은 느리게 가도 괜찮아요.',
            '오늘은 나를 다독이는 날로 해요.',
            '{nickname}님, 여기까지 온 것만으로도 진짜 수고하셨어요.',
            '내일은 내일의 컨디션으로 다시 해도 됩니다.'
            ]
        },

        midLow: {
            main: [
            '{nickname}님, 오늘은 컨디션이 애매한 날 같아요.',
            '마음이 살짝 무거운 편이에요.',
            '{nickname}님, 기분이 조금 내려앉아 있는 느낌이네요.',
            '에너지가 들쭉날쭉할 수 있는 날이에요.',
            '{nickname}님, 오늘은 기분이 쉽게 흔들릴 수 있는 날 같아요.',
            '살짝 지치긴 했는데, 아직은 괜찮은 편이에요.',
            '{nickname}님 마음이 약간 축 처지는 흐름이에요.',
            '생각이 많아지기 쉬운 무드예요.',
            '{nickname}님, 뭔가 애매하게 피곤한 느낌… 딱 그 지점이에요.',
            '기분이 “괜찮은 듯 아닌 듯” 그 사이네요.',
            '{nickname}님, 오늘은 감정이 조용히 내려앉는 편이에요.',
            '조금만 더 밀리면 확 지칠 수 있는 상태 같아요.',
            '{nickname}님, 마음이 뻐근한 날일 수 있어요.',
            '오늘은 작은 일에도 신경이 쓰일 수 있어요.',
            '{nickname}님 컨디션이 살짝 불안정한 쪽에 가까워 보여요.',
            '기분이 찜찜하게 남는 날일 수 있어요.',
            '{nickname}님, 기운이 살짝 빠져서 속도가 안 나는 날 같아요.',
            '오늘은 ‘기분 관리’가 필요한 편이에요.'
            ],
            tip: [
            '{nickname}님, 큰 결정은 미루고 작은 성취 하나만 챙겨봐요.',
            '우선순위 1개만 정하고 나머지는 과감히 내려놔요.',
            '{nickname}님, 짧은 산책이나 샤워 같은 리셋 루틴이 도움이 돼요.',
            '오늘은 "완벽" 말고 "완료"만 목표로 잡아도 좋아요.',
            '{nickname}님, 할 일 3개 적고 그중 1개만 해도 성공이에요.',
            'SNS/쇼츠 조금만 줄여도 멘탈이 덜 피곤해져요.',
            '{nickname}님, 지금은 “정리”보다 “정돈” 정도만 해도 충분해요.',
            '몸이 무거우면 마음도 같이 무거워져요. 스트레칭 2분만!',
            '{nickname}님, 오늘은 계획을 빡세게 말고 유연하게 가요.',
            '뭔가 불편한 감정이 있으면 이름만 붙여도 덜 커져요.',
            '{nickname}님, 작은 기쁨 하나(맛있는 거, 음악, 향)만 챙겨도 좋아요.',
            '잠깐 환기만 해도 생각이 덜 답답해져요.',
            '{nickname}님, 일단 “시작 버튼”만 눌러보면 의외로 굴러가요.',
            '오늘은 에너지 아끼는 게 실력입니다.',
            '{nickname}님, 내일의 나를 위해 오늘은 과부하만 피하기!'
            ],
            closing: [
            '{nickname}님, 여기까지 온 것만으로도 충분히 수고하셨어요.',
            '내일의 내가 고마워할 정도로만 해도 성공이에요.',
            '{nickname}님, 오늘은 페이스 조절이 정답입니다.',
            '오늘은 “적당히”가 최고의 전략이에요.',
            '{nickname}님, 조금 힘들어도 여기까지 잘 왔어요.',
            '오늘은 무리만 안 해도 대성공이에요.',
            '{nickname}님, 괜찮아요. 오늘은 속도를 줄이는 날이에요.',
            '지금 이 정도면 충분히 잘하고 있어요.',
            '{nickname}님, 오늘은 버티기 말고 조절하기로 합시다.',
            '오늘 하루도 잘 넘기셨어요.',
            '{nickname}님, 내일은 내일의 컨디션으로 다시 해보면 돼요.',
            '기분이 애매한 날도, 결국 지나갑니다.',
            '{nickname}님, 오늘도 스스로를 챙긴 거 진짜 잘한 거예요.'
            ]
        },

        mid: {
            main: [
            '{nickname}님, 오늘은 무난-보통 느낌이에요.',
            '감정이 크게 요동치진 않네요.',
            '{nickname}님, 전체적으로 안정적인 흐름이에요.',
            '평온한 편이라 리듬 유지가 좋아 보여요.',
            '{nickname}님, 오늘은 딱 “평타” 느낌이에요.',
            '감정 컨디션이 균형 잡혀 있어요.',
            '{nickname}님, 조금의 흔들림은 있어도 전체 흐름은 괜찮아요.',
            '평소 페이스를 유지하기 좋은 날이에요.',
            '{nickname}님, 기분이 비교적 담백하고 차분한 편이에요.',
            '오늘은 크게 나쁘지도, 크게 좋지도 않은 안정권이에요.',
            '{nickname}님, 감정이 적당히 정돈된 느낌이에요.',
            '무난하게 하루를 굴릴 수 있는 컨디션이에요.',
            '{nickname}님 마음이 비교적 평평한 상태예요.',
            '오늘은 “유지” 전략이 잘 먹히는 날이에요.',
            '{nickname}님, 컨디션이 과열도 과냉도 아닌 딱 그 중간이에요.'
            ],
            tip: [
            '{nickname}님, 루틴 하나만 지켜도 내일이 확 편해져요.',
            '책상 정리 3분 같은 "작은 정리"가 은근 기분 올려줘요.',
            '{nickname}님, 오늘 잘한 일 한 가지를 적어두면 멘탈이 단단해져요.',
            '너무 무리만 안 하면 오늘은 충분히 좋은 날이에요.',
            '{nickname}님, 물 마시는 양만 챙겨도 컨디션이 달라져요.',
            '오늘은 “조금씩” 쌓기에 좋은 날이에요.',
            '{nickname}님, 작은 운동 5분이면 기분이 미묘하게 올라가요.',
            '미뤄둔 일 하나만 정리하면 머리가 맑아져요.',
            '{nickname}님, 오늘은 새로운 거 말고 익숙한 걸 잘 굴리는 게 좋아요.',
            '잠들기 전에 내일 할 일 1줄만 적어두면 마음이 편해요.',
            '{nickname}님, 기분이 무난할 때 생활 리듬 잡아두면 진짜 득이에요.',
            '지금의 흐름을 깨지 않게, 과부하만 피하기!',
            '{nickname}님, 오늘은 “꾸준함”이 제일 빛나는 날이에요.'
            ],
            closing: [
            '{nickname}님, 이 정도면 꽤 괜찮은 하루예요.',
            '지금 흐름 유지하면 됩니다.',
            '{nickname}님, 무난함이 사실 제일 강력한 안정이죠.',
            '오늘은 평온하게 잘 굴러갔습니다.',
            '{nickname}님, 이 페이스면 내일도 괜찮게 이어질 가능성 높아요.',
            '오늘은 “안정” 그 자체네요.',
            '{nickname}님, 오늘 하루 잘 유지하셨어요.',
            '이 정도면 충분히 잘한 하루예요.',
            '{nickname}님, 큰 사건 없이 지나간 하루가 은근 귀한 거 아시죠?',
            '좋아요, 이 흐름 계속 갑시다.',
            '{nickname}님, 오늘도 차분하게 마무리하면 완벽이에요.'
            ]
        },

        midHigh: {
            main: [
            '{nickname}님, 오늘 마음 상태 꽤 좋아요.',
            '기분이 안정적이고 단단해 보여요.',
            '{nickname}님, 좋은 흐름을 타고 있는 느낌이에요.',
            '컨디션이 꽤 괜찮게 나왔어요.',
            '{nickname}님, 오늘은 멘탈이 꽤 탄탄한 편이에요.',
            '기분이 괜찮게 올라와 있어요.',
            '{nickname}님, 오늘은 집중도 잘 될 가능성이 높아 보여요.',
            '감정 에너지가 적당히 충전된 상태예요.',
            '{nickname}님 마음이 비교적 가벼운 편이에요.',
            '오늘은 일상도 잘 굴리고 있는 느낌이에요.',
            '{nickname}님, 긍정 쪽으로 살짝 기울어 있는 흐름이에요.',
            '오늘은 “할 만하다” 모드네요.',
            '{nickname}님, 컨디션이 한 단계 위로 올라와 있어요.',
            '{nickname}님 오늘 기분, 생각보다 괜찮죠? 😎'
            ],
            tip: [
            '{nickname}님, 미뤄둔 거 하나만 끝내면 성취감이 확 올라가요.',
            '내일을 위해 준비 하나만 해두면 완전 꿀이에요.',
            '{nickname}님, 좋았던 포인트를 한 줄로 남기면 재현하기 쉬워요.',
            '이 템포로만 가도 충분히 잘하고 있어요.',
            '{nickname}님, 컨디션 좋을 때 생활 리듬 한 번 정리해두면 이득이에요.',
            '가벼운 운동/정리 하나만 해도 오늘 만족도 올라가요.',
            '{nickname}님, 하고 싶은 거 하나만 딱 실행해보세요.',
            '오늘은 “한 끗” 더 하면 내일이 편해지는 날이에요.',
            '{nickname}님, 좋은 기분일수록 수면만 지키면 승리예요.',
            '오늘 잘 된 포인트를 기억해두면 다음에 꺼내 쓰기 좋아요.',
            '{nickname}님, 힘이 남는다면 내일의 귀찮음을 조금만 선제거해두기!'
            ],
            closing: [
            '{nickname}님, 오늘의 나 칭찬 한 번 해주고 가시죠.',
            '이 페이스 유지하면 진짜 좋습니다.',
            '{nickname}님, 지금 리듬 계속 가져가요 😎',
            '좋아요, 오늘 흐름 제대로 잡았네요.',
            '{nickname}님, 오늘은 스스로 만족해도 되는 날이에요.',
            '이 정도면 하루 잘 뽑았습니다.',
            '{nickname}님, 오늘의 컨디션 꽤 든든합니다.',
            '지금처럼만 가도 충분히 멋져요.',
            '{nickname}님, 오늘은 “괜찮은 나”로 저장해도 됩니다.',
            '좋은 흐름이에요. 마무리만 깔끔하게!'
            ]
        },

        high: {
            main: [
            '{nickname}님, 와 오늘은 마음 온도 거의 만점이에요.',
            '오늘 에너지 진짜 좋게 나왔어요.',
            '{nickname}님, 컨디션이 최고치에 가까워 보여요.',
            '기분이 엄청 밝은 쪽으로 기울어 있네요.',
            '{nickname}님, 오늘은 분위기 자체가 “상승장”이에요.',
            '감정 점수로만 보면 오늘은 거의 MVP입니다.',
            '{nickname}님, 오늘 텐션 좋다… 이건 인정이에요.',
            '오늘은 마음이 가볍고 탄력 있어 보여요.',
            '{nickname}님, 기분이 상쾌하게 올라와 있네요.',
            '오늘은 좋은 일이 잘 붙는 날 같은 느낌!',
            '{nickname}님, 오늘은 “나 좀 된다” 모드예요.',
            '감정 에너지가 꽉 찬 날이에요.',
            '{nickname}님, 오늘은 기분이 반짝반짝한 편이에요 ✨',
            '컨디션이 거의 풀충전 상태네요.'
            ],
            tip: [
            '{nickname}님, 하고 싶던 거 하나 딱 처리하면 오늘이 레전드 됩니다.',
            '좋은 날일수록 수면/식사만 지키면 완벽해요.',
            '{nickname}님, 이 기분이 왜 왔는지 한 줄로 적어두면 다음에도 꺼내 쓸 수 있어요.',
            '오늘은 주변에도 좋은 영향 뿌리고 다니셨겠는데요?',
            '{nickname}님, 컨디션 좋을 때 “미뤄둔 귀찮은 거” 하나만 처리하면 내일이 편해요.',
            '기분 좋은 날에 찍어둔 기록이 나중에 진짜 큰 힘이 돼요.',
            '{nickname}님, 오늘은 뭘 해도 흡수 잘 되는 날이라 배움/정리에 최적이에요.',
            '에너지 남는 김에 책상/방 정리 살짝만 해도 만족도 급상승!',
            '{nickname}님, 좋은 기분은 공유하면 오래 갑니다. 고마운 사람 한 명 떠올려봐요.',
            '오늘은 나를 아끼는 마무리만 하면 완성입니다.',
            '{nickname}님, 기세 좋을 때 과속만 조심하면 오늘 완벽해요.'
            ],
            closing: [
            '{nickname}님, 이런 날은 저장각이에요. 진짜로요.',
            '좋은 흐름 제대로 탔습니다 🔥',
            '{nickname}님, 오늘의 기분 오래 가게 마무리만 깔끔하게!',
            '오늘은 자신감 가져도 됩니다. 합법입니다.',
            '{nickname}님, 오늘 하루 아주 잘 뽑혔어요.',
            '좋아요. 이 느낌 그대로 쭉 갑시다.',
            '{nickname}님, 오늘은 “좋은 나”로 확정!',
            '오늘 컨디션은 칭찬 스탬프 찍고 가야 돼요.',
            '{nickname}님, 이 기분 오래 가게 잘 마무리해봐요.',
            '오늘은 진짜 잘했습니다. 인정!',
            '{nickname}님, 오늘은 나 자신이 제일 든든한 날이네요 😎'
            ]
        }
        };

    // 조합 생성
    let comment = `${pick(parts[band].main)} ${pick(parts[band].tip)} ${pick(parts[band].closing)}`;

    comment = comment.replace(/{nickname}/g, nickname || '사용자');

    // 직전 코멘트와 완전 동일하면 한 번 더 생성
    const prev = lastCommentByUser.get(userId);
    if (prev && prev === comment) {
        comment = `${pick(parts[band].main)} ${pick(parts[band].tip)} ${pick(parts[band].closing)}`;
    }
    lastCommentByUser.set(userId, comment);

    return comment;
};

// STREAK 업데이트 함수
async function updateUserStreak(userId, diaryDate) {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const writtenDate = new Date(diaryDate);
        writtenDate.setHours(0, 0, 0, 0);

        // 당일 일기가 아니면 streak 업데이트 안 함
        if (writtenDate.getTime() !== today.getTime()) {
            return;
        }

        // 현재 사용자 정보 조회
        const [userRows] = await pool.query(
            `SELECT LAST_DIARY_DATE, STREAK_DAYS FROM USERS WHERE USER_ID = ?`,
            [userId]
        );

        if (userRows.length === 0) return;

        const lastDiaryDate = userRows[0].LAST_DIARY_DATE
            ? new Date(userRows[0].LAST_DIARY_DATE)
            : null;

        if (lastDiaryDate) {
            lastDiaryDate.setHours(0, 0, 0, 0);
        }

        let currentStreak = userRows[0].STREAK_DAYS || 0;

        // 오늘 이미 업데이트했으면 패스
        if (lastDiaryDate && lastDiaryDate.getTime() === today.getTime()) {
            return;
        }

        // Streak 계산
        if (!lastDiaryDate) {
            // 첫 일기 작성
            currentStreak = 1;
        } else {
            const diffDays = Math.floor((today - lastDiaryDate) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                // 어제 작성했으면 연속 증가
                currentStreak += 1;
            } else if (diffDays > 1) {
                // 하루 이상 건너뛰었으면 초기화
                currentStreak = 1;
            }
        }

        // USERS 테이블 업데이트
        await pool.query(
            `UPDATE USERS 
             SET LAST_DIARY_DATE = ?, STREAK_DAYS = ? 
             WHERE USER_ID = ?`,
            [today.toISOString().split('T')[0], currentStreak, userId]
        );

        console.log(`✅ Streak 업데이트: User ${userId} - ${currentStreak}일`);

    } catch (error) {
        console.error('Streak 업데이트 에러:', error);
    }
}

// 일기 감정 분석
exports.analyzeDiary = async (req, res) => {
    try {
        const { userId, nickname } = req.session.user;
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
        const finalScore = Number(emotionResult.finalScore) || 0;

        console.log(`감정 점수: ${finalScore}점`)

        // 코멘트 생성 함수
        const comment = generateComment(finalScore, userId, nickname)

        await pool.query(
            `
            INSERT INTO DIARY (USER_ID, DIARY_DATE, CONTENT, EMO_SCORE, COMMENT_TEXT)
            VALUES (?, ?, ?, ?, ?)
            `,
            [userId, parseDate, content, finalScore, comment]
        )

        // 당일 일기 작성 시 streak 업데이트
        await updateUserStreak(userId, parseDate);

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

// 일기 조회(DiaryViewer)
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

        let emotionEmoji = '😐' // 기본값 (mid)
        if (score <= 20) emotionEmoji = '😭'        // low
        else if (score <= 40) emotionEmoji = '😥'   // midLow
        else if (score <= 60) emotionEmoji = '😐'   // mid
        else if (score <= 80) emotionEmoji = '🙂'   // midHigh
        else emotionEmoji = '🥰'                     // high

        return res.json({
            success: true,
            diary: {
                content: rows[0].CONTENT,
                score,
                emotionEmoji
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

// 일기 조회(WeeklyStats)
exports.getDiaryForResult = async (req, res) => {
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
            SELECT CONTENT, EMO_SCORE, COMMENT_TEXT
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

        // emotionScores 재생성
        const emotionResult = await require('./emotionController').getEmotionScore(rows[0].CONTENT)

        return res.json({
            success: true,
            diary: {
                content: rows[0].CONTENT,
                emoScore: rows[0].EMO_SCORE,
                emotionScores: emotionResult.emotionScores,
                comment: rows[0].COMMENT_TEXT
            }
        })
    } catch (error) {
        console.error('일기 상세 조회 실패:', error)
        return res.status(500).json({
            success: false,
            message: '일기 조회 실패'
        })
    }
}

// 일기 수정
exports.updateDiary = async (req, res) => {
    try {
        const { userId, nickname } = req.session.user;
        const { date, content } = req.body

        if (!date || !content || content.trim() === '') {
            return res.status(400).json({
                success: false,
                message: '내용이 비어있습니다.'
            })
        }

        if (content.trim().length < 50) {
            return res.status(400).json({
                success: false,
                message: '일기는 최소 50자 이상이어야 합니다.'
            })
        }

        const emotionResult = await emotionController.getEmotionScore(content)
        const finalScore = Number(emotionResult.finalScore) || 0

        // 코멘트 생성 함수
        const comment = generateComment(finalScore, userId, nickname)

        await pool.query(
            `
            UPDATE DIARY
               SET CONTENT = ?, EMO_SCORE = ?, COMMENT_TEXT = ?
             WHERE USER_ID = ? AND DIARY_DATE = ?
            `,
            [content, finalScore, comment, userId, date]
        )

        return res.json({
            success: true,
            finalScore: emotionResult.finalScore,
            emotionScores: emotionResult.emotionScores,
            comment
        })

    } catch (err) {
        console.error('일기 수정 실패:', err)
        return res.status(500).json({
            success: false,
            message: '일기 수정 실패'
        })
    }
}

// 어제 일기 조회
exports.getYesterdayDiary = async (req, res) => {
    try {
        const { date } = req.query
        const userId = req.session.user.userId

        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'date 파라미터 없음'
            })
        }

        const today = new Date(date)
        const yesterday = new Date(today)
        yesterday.setDate(today.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]

        const [rows] = await pool.query(
            `
            SELECT CONTENT, EMO_SCORE
              FROM DIARY
             WHERE USER_ID = ? AND DIARY_DATE = ?
            `,
            [userId, yesterdayStr]
        )

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: '어제 일기 없음'
            })
        }

        const emotionResult = await require('./emotionController').getEmotionScore(rows[0].CONTENT)

        return res.json({
            success: true,
            diary: {
                content: rows[0].CONTENT,
                score: rows[0].EMO_SCORE,
                emotionScores: emotionResult.emotionScores
            }
        })
    } catch (error) {
        console.error('어제 일기 조회 실패:', error)
        return res.status(500).json({
            success: false,
            message: '어제 일기 조회 실패'
        })
    }
}

exports.getDiaryMonth = async (req, res) => {
  try {
    const userId = req.session.user.userId

    const year = Number(req.query.year);
    const month = Number(req.query.month); // 1~12

    if (!year || !month || month < 1 || month > 12) {
      return res.status(400).json({ success: false, message: 'year/month가 올바르지 않습니다.' });
    }

    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const end = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

    const sql = `
      SELECT
        DATE_FORMAT(DIARY_DATE, '%Y-%m-%d') AS dateKey,
        EMO_SCORE AS score
      FROM DIARY
      WHERE USER_ID = ?
        AND DIARY_DATE >= ?
        AND DIARY_DATE < ?
      ORDER BY DIARY_DATE ASC
    `;

    const [rows] = await pool.query(sql, [userId, start, end]);

    return res.json({
      success: true,
      entries: rows.map(r => ({
        dateKey: r.dateKey,
        score: Number(r.score),
      })),
    });
  } catch (err) {
    console.error('월별 감정 조회 실패:', err);
    return res.status(500).json({ success: false, message: '서버 오류' });
  }
};

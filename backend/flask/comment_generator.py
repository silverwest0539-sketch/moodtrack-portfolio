import random

# 1) 점수 구간(band) 결정

def band(score: float) -> str:
    if score <= 19: return "b0"
    if score <= 39: return "b1"
    if score <= 59: return "b2"
    if score <= 79: return "b3"
    return "b4"

# 2) 확률로 톤 선택

def tone_from_emotion_scores(emotion_scores: dict) -> str:
    # emotion_scores 예: {'기쁨': 10.0, '슬픔': 60.0, '화남': 20.0, '중립': 10.0}
    if not emotion_scores:
        return "calm"
    top = max(emotion_scores.items(), key=lambda x: x[1])[0]
    if top == "기쁨": return "bright"
    if top == "슬픔": return "heavy"
    if top == "화남": return "tense"
    return "calm"

# 3) 최근 문장 반복 피해서 뽑기

def pick_avoid_recent(pool, recent_texts, max_try=10):
    recent = set(recent_texts or [])
    for _ in range(max_try):
        t = random.choice(pool)
        if t not in recent:
            return t
    return random.choice(pool)  # 다 겹치면 그냥 아무거나

def merge_recent(recent_texts, used_texts, max_keep=30):
    recent_texts = (recent_texts or []) + used_texts
    return recent_texts[-max_keep:]

# 4) 문장 풀

PH = {
    "empathy": {
        "bright": [
            "오늘은 전체적으로 마음이 가벼운 흐름이었을 수 있어요.",
            "오늘 기록에서 ‘괜찮게 굴러간 날’ 느낌이 보여요.",
            "오늘은 스스로에게 칭찬 한 번쯤 해도 되는 날 같아요 ㅋㅋ",
            "오늘도 기록 남긴 거 자체가 이미 좋은 루틴이에요."
        ],
        "heavy": [
            "오늘은 마음이 조금 무거웠을 수 있어요.",
            "오늘 하루가 가볍게 지나가진 않았을지도요.",
            "지친 날에 기록 남기는 게 제일 어려운데… 오늘 그걸 하셨어요.",
            "오늘은 스스로에게 조금 더 관대해져도 괜찮아요."
        ],
        "tense": [
            "오늘은 예민해지기 쉬운 하루였을 수 있어요.",
            "오늘은 신경이 곤두서는 순간이 있었을지도요.",
            "오늘은 스트레스가 몸에 남기 쉬운 날일 수 있어요.",
            "이런 날에도 기록을 남긴 건 진짜 잘하신 거예요."
        ],
        "calm": [
            "오늘은 담담하게 흘러간 하루였을 수 있어요.",
            "오늘은 큰 기복 없이 지나간 느낌이네요.",
            "오늘은 차분하게 버텨낸 하루였을지도요.",
            "이런 날이 오히려 페이스 잡기 좋습니다."
        ],
    },

    "observe": {
        "b4": [
            "감정점수는 {score}점으로 상위 구간이에요.",
            "오늘 점수 {score}점이면 컨디션이 꽤 좋은 편입니다."
        ],
        "b3": [
            "감정점수는 {score}점으로 안정 구간이에요.",
            "오늘 점수 {score}점이면 무난하게 버틴 편이에요."
        ],
        "b2": [
            "감정점수 {score}점은 중간 구간이라 피로가 섞였을 수 있어요.",
            "오늘 점수 {score}점이면 컨디션이 딱 중간쯤이에요."
        ],
        "b1": [
            "감정점수 {score}점이면 회복이 필요할 수 있는 구간이에요.",
            "오늘 점수 {score}점은 속도를 줄이는 게 맞을 수 있어요."
        ],
        "b0": [
            "감정점수 {score}점이면 오늘은 정말 버거웠을 수 있어요.",
            "오늘 점수 {score}점이면 지금은 쉬는 게 최우선이에요."
        ],
    },

    "insight": {
        "b4": [
            "좋은 날일수록 ‘어떤 게 도움 됐는지’ 하나만 기억해두면 다음에도 재현이 쉬워요.",
            "오늘 같은 흐름은 유지가 핵심이에요. 과하게 끌어올리기보다 ‘지키기’가 더 강합니다."
        ],
        "b3": [
            "오늘은 큰 변화보다 ‘페이스 유지’가 더 잘 맞는 날일 수 있어요.",
            "무난하게 버틴 날은 누적 피로가 숨어 있을 수 있어서 마무리가 중요해요."
        ],
        "b2": [
            "애매한 날은 결론을 내리려 할수록 더 피곤해질 때가 있어요. 오늘은 가볍게 두셔도 됩니다.",
            "지금은 ‘정리’보다 ‘회복’이 먼저일 수 있어요. 작은 회복이 생각보다 큰 차이를 만들어요."
        ],
        "b1": [
            "오늘은 스스로를 몰아붙이는 것보다, 부담을 덜어내는 게 훨씬 도움이 될 수 있어요.",
            "이런 날은 ‘해결’보다 ‘버티기+회복’ 조합이 제일 효율적이에요."
        ],
        "b0": [
            "오늘은 무언가를 ‘바꾸기’보다, 우선 몸과 마음을 안전하게 지키는 게 1순위예요.",
            "지금은 설명이나 분석보다, 쉬는 게 가장 현실적인 도움일 수 있어요."
        ],
    },

    "suggest": {
        "b4": [
            "좋았던 날의 루틴 하나만 저장해두면 다음에도 도움 돼요.",
            "내일은 ‘비슷하게만’ 가도 성공이에요. 욕심 금지!"
        ],
        "b3": [
            "오늘 페이스 유지가 제일 좋은 전략이에요.",
            "마무리 루틴만 챙기면 내일 컨디션도 잘 이어질 듯해요."
        ],
        "b2": [
            "오늘은 ‘작게 하나’만 해도 충분해요. 목표를 크게 잡지 마셔요.",
            "스트레칭이나 짧은 산책처럼 가벼운 회복을 추천드려요."
        ],
        "b1": [
            "오늘은 할 일을 줄이는 게 오히려 실력입니다 ㅋㅋ",
            "따뜻한 물 한 잔 + 잠깐 눈 감기 같은 작은 회복부터요."
        ],
        "b0": [
            "오늘은 ‘회복’만 해도 충분합니다. 지금은 그게 1순위예요.",
            "가능하면 큰 결정을 미루고, 안전하게 쉬는 쪽으로 가요."
        ],
    },

    "question": {
        "b4": ["오늘 가장 만족스러웠던 순간이 뭐였어요?"],
        "b3": ["오늘 잘한 선택 하나만 떠올려보셔요."],
        "b2": ["오늘 에너지를 가장 많이 쓴 순간이 언제였어요?"],
        "b1": ["지금 가장 필요한 건 ‘쉬기’ 쪽일까요, ‘정리’ 쪽일까요?"],
        "b0": ["지금 당장 할 수 있는 가장 작은 회복은 뭐가 있을까요?"],
    }
}

# 5) 최종: 5문장 코멘트 생성 + recent 갱신

def generate_comment(final_score: float, emotion_scores: dict, recent_texts=None):
    recent_texts = recent_texts or []

    b = band(final_score)
    t = tone_from_emotion_scores(emotion_scores)

    s1 = pick_avoid_recent(PH["empathy"][t], recent_texts)
    s2 = pick_avoid_recent(PH["observe"][b], recent_texts).format(score=round(final_score, 2))
    s3 = pick_avoid_recent(PH["insight"][b], recent_texts)
    s4 = pick_avoid_recent(PH["suggest"][b], recent_texts)
    s5 = pick_avoid_recent(PH["question"][b], recent_texts)

    comment = " ".join([s1, s2, s3, s4, s5])

    used = [s1, s2, s3, s4, s5]
    new_recent = merge_recent(recent_texts, used, max_keep=30)

    return comment, new_recent
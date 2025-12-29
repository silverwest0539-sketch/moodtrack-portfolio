from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import re

class EmotionAnalyzer:
    def __init__(self, model_path="./models/kcbert_final_final"):
        self.tokenizer = AutoTokenizer.from_pretrained(model_path)
        self.model = AutoModelForSequenceClassification.from_pretrained(model_path)
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model.to(self.device)
        self.model.eval()

        self.id_to_emotion = {
            0: '기쁨',
            1: '슬픔',
            2: '화남',
            3: '불안',
            4: '중립'
        }

    def preprocess_final(self, text):
        # 1. 반복 이모티콘 정규화 (3개로 통일)
        text = re.sub(r'([ㅋㅎ])\1{2,}', r'\1\1\1', text)
        text = re.sub(r'([ㅠㅜ])\1{2,}', r'\1\1\1', text)

        # 2. 이모티콘과 본문 띄어쓰기
        text = re.sub(r'(\S)([ㅋㅎㅠㅜ]{2,})', r'\1 \2', text)

        # 3. 반복 특수문자 정규화
        text = re.sub(r'!{2,}', '!!!', text)
        text = re.sub(r'\?{2,}', '???', text)

        # 4. 말줄임표 정규화
        text = re.sub(r'\.{2,}', '...', text)
        text = text.replace('…', '...')

        # 5. 단독 마침표 제거
        text = re.sub(r'(?<!\.)\.(?!\.)', '', text)

        # 6. ㅠㅠ, ㅜㅜ 제거
        text = re.sub(r'\s*[ㅠㅜ]+\s*', ' ', text)

        # 7. 공백 정리
        text = re.sub(r'\s+', ' ', text).strip()

        return text

    def analyze(self, diary_text):
        # 텍스트 전처리
        clean_text = self.preprocess_final(diary_text)

        # 1. 토크나이징
        inputs = self.tokenizer(
            clean_text,
            return_tensors="pt",
            max_length=128,
            padding=True,
            truncation=True
        )

        inputs = {k: v.to(self.device) for k, v in inputs.items()}

        # 2. 모델 예측
        with torch.no_grad():
            outputs = self.model(**inputs)
            probs = torch.nn.functional.softmax(outputs.logits, dim=-1)[0]

        # 3. 감정별 점수
        emotion_scores = {
            '기쁨': round(probs[0].item() * 100, 2),
            '슬픔': round(probs[1].item() * 100, 2),
            '화남': round(probs[2].item() * 100, 2),
            '불안': round(probs[3].item() * 100, 2),
            '중립': round(probs[4].item() * 100, 2),
        }

        # 4. 최종 점수 계산
        joy = emotion_scores['기쁨']
        neutral = emotion_scores['중립']
        sadness = emotion_scores['슬픔']
        anger = emotion_scores['화남']
        anxiety = emotion_scores['불안']

        positive = joy * 0.4 + neutral * 0.1
        negative = sadness * 0.2 + anger * 0.2 + anxiety * 0.1

        final_score = 50 + positive - negative
        final_score = max(0, min(100, final_score))

        return {
            'emotion_scores': emotion_scores,
            'final_score': round(final_score, 2),
        }
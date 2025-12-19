from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

class EmotionAnalyzer:

    def __init__(self, model_path="./models/kcbert_final_v3"):
 
        self.tokenizer = AutoTokenizer.from_pretrained(model_path) # 토크나이저 로드
        self.model = AutoModelForSequenceClassification.from_pretrained(model_path) # 모델 로드

        self.device = torch.device('cuba' if torch.cuda.is_available() else 'cpu') # 실행 장치 설정
        self.model.to(self.device) # 모델을 선택한 장치로 이동
        self.model.eval() # 평가 모드로 전환

        # 숫자->감정 이름 매핑
        self.id_to_emotion = {
            0: '기쁨',
            1: '슬픔',
            2: '화남',
            3: '중립'
        }

    def analyze(self, diary_text):
        
        # 1. 텍스트 전처리
        inputs = self.tokenizer(
            diary_text,
            return_tensors = "pt", # PyTorch 텐서 형태로 반환
            max_length = 128,
            padding = True,
            truncation = True
        )


        # 2. 모델 예측
        with torch.no_grad(): # 학습 안 함, 예측만
            outputs = self.model(**inputs)
            probs = torch.nn.functional.softmax(outputs.logits, dim=-1)[0]

        # 3. 감정별 점수 계산
        emotion_scores = {
            '기쁨': round(probs[0].item() * 100, 2),
            '슬픔': round(probs[1].item() * 100, 2),
            '화남': round(probs[2].item() * 100, 2),
            '중립': round(probs[3].item() * 100, 2),
        }

        # 4. 최종 점수 산출
        joy = emotion_scores['기쁨']
        neutral = emotion_scores['중립']
        sadness = emotion_scores['슬픔']
        anger = emotion_scores['화남']

        positive = joy * 0.5 + neutral * 0.1
        negative = sadness * 0.3 + anger * 0.3

        final_score = 50 + positive - negative
        final_score = max(0, min(100, final_score))

        # 5. 결과 반환
        return {
            'emotion_scores': emotion_scores,
            'final_score': round(final_score, 2)
        }
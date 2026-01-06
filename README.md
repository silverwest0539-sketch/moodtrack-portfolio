# MoodTrack 
> 일기 텍스트 기반 감정 분석 & 감정 시각화 서비스

## 프로젝트 소개
MoodTrack는 사용자가 작성한 일기 텍스트를 AI가 분석하여  
감정 상태를 분류하고, 이를 시각적으로 확인할 수 있도록 돕는 감성 일기 서비스입니다.

본 프로젝트는 팀 단위로 진행되었으며,  
**본 레포지토리는 개인 포트폴리오 목적에 맞게 정리한 버전입니다.**

---

## 팀 구성 및 역할
- 팀 구성: 4명
- 개발 기간: 2025.11 ~ 2025.12

### 담당 역할 (본인)
- AI 감정 분석 모델 파인튜닝 (KC-BERT / KoELECTRA 비교 실험)
- 데이터 전처리 및 클래스 불균형 처리
- Flask 기반 감정 분석 API 구현
- 모델 추론 결과를 백엔드와 연동

---

## 주요 기능
- 일기 작성 및 저장
- 텍스트 기반 감정 분석 (기쁨 / 분노 / 슬픔 / 불안 / 중립)
- 감정 결과 시각화
- 감정 변화 기록 확인

---

## 기술 스택
### Frontend
- React
- Chart.js

### Backend
- Node.js
- Express
- MySQL

### AI / ML
- PyTorch
- HuggingFace Transformers
- KC-BERT / KoELECTRA
- Flask (모델 서빙)

---

## 시스템 구조
```text
[Frontend]
   ↓
[Node.js / Express]
   ↓
[Flask API]
   ↓
[Fine-tuned BERT Model]

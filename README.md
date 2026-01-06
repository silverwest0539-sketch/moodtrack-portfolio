# MoodTrack 
> KcBERT 모델 기반 감성 분석 다이어리 웹 서비스

## 프로젝트 소개
MoodTrack은 사용자에게 일기 텍스트를 입력받아
파인튜닝된 KcBERT 기반 모델로 감정을 분류해 감정 점수를 산출하고
분석 결과를 다양하게 시각화하여 보여주는 감정 분석 서비스입니다.

본 프로젝트는 팀 단위로 진행되었으며,  
**본 레포지토리는 개인 포트폴리오 목적에 맞게 정리한 버전입니다.**

---

## 팀 구성 및 역할
- 팀 구성: 4명 (Front 2, Back 1, AI 1)
- 개발 기간: 2025. 12. 17 ~ 2025. 12. 31

### 담당 역할 (본인)
- AI 감정 분석 모델 파인튜닝 (KcBERT)
- 데이터 전처리 및 클래스 불균형 처리
- Flask 기반 감정 분석 API 구현
- 모델 추론 결과를 백엔드와 연동
- 일기 관련 CRUD 구현

---

## 주요 기능
- 일기 텍스트 AI 감성 분석 및 감정 점수(0~100) 산출
- 감정 점수 구간별 공감형 코멘트 제공
- 캘린더 기반 일기 조회 및 수정
- 일/주/월 감정 통계 시각화

---

## 기술 스택
- Language: JavaScript, Python
- Server: Node.js (Express), Flask
- Framework / Library: React (Vite), Chart.js
- DB: MySQL
- IDE: Visual Studio Code
- AI: KcBERT (Fine-tuning)
- Collab: GitHub, MyBox

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

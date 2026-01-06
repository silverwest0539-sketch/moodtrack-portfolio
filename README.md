# MoodTrack 
> 일기 텍스트 기반 감정 분석 & 감정 시각화 서비스

## 프로젝트 소개
MoodTrack는 사용자가 작성한 일기 텍스트를 AI가 분석하여  
감정 상태를 분류하고, 이를 시각적으로 확인할 수 있도록 돕는 감성 일기 서비스입니다.

본 프로젝트는 팀 단위로 진행되었으며,  
**본 레포지토리는 개인 포트폴리오 목적에 맞게 정리한 버전입니다.**

---

## 팀 구성 및 역할
- 팀 구성: 4명 (Front 2, Back 1, AI 1)
- 개발 기간: 2025. 12. 17 ~ 2025. 12. 31

### 담당 역할 (본인)
- AI 감정 분석 모델 파인튜닝 (KC-BERT / KoELECTRA 비교 실험)
- 데이터 전처리 및 클래스 불균형 처리
- Flask 기반 감정 분석 API 구현
- 모델 추론 결과를 백엔드와 연동

---

## 주요 기능
- 일기 텍스트 AI 감성 분석 및 감정 점수(0~100) 산출
- 감정 점수 구간별 공감형 코멘트 제공
- 캘린더 기반 일기 조회 및 수정
- 일/주/월 감정 통계 시각화

---

## 기술 스택
Language: JavaScript, Python
Server: Node.js (Express), Flask
Framework / Library: React (Vite), Chart.js
DB: MySQL
IDE: Visual Studio Code
AI: KcBERT (Fine-tuning)
Collab: GitHub, MyBox

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

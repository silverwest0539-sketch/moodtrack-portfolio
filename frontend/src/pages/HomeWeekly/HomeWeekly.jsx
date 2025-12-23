// src/pages/HomeWeekly/HomeWeekly.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomeWeekly.css';
import logo from '../../assets/images/logos/4logo.PNG'; // 로고 경로는 실제 프로젝트에 맞게 확인 필요

const GREETINGS = [
  "곧 크리스마스예요, 계획 있으신가요?",
  "오늘도 기록하러 와줘서 고마워요",
  "오늘 하루는 어떤 마음이었나요?",
  "지금의 감정도 충분히 소중해요",
];

const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const DAY_NAMES_KO = ['일', '월', '화', '수', '목', '금', '토'];

const HomeWeekly = () => {
  const navigate = useNavigate();

  // --- State 관리 ---
  const [weekDays, setWeekDays] = useState([]); // 백엔드(가상) 데이터 담을 곳
  const [greeting, setGreeting] = useState('');
  
  // 사용자 정보 (추후 백엔드 연동 시 대체)
  const [nickname] = useState('45정');
  const [streak] = useState(2);
  const [points] = useState(120);

  // --- 초기 데이터 로드 (백엔드 통신 시뮬레이션) ---
  useEffect(() => {
    // 1. 인사말 랜덤 설정
    setGreeting(GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);

    // 2. 날짜 및 감정 데이터 생성 (기존 로직 활용)
    const today = new Date();
    const days = [];

    // 과거 3일(-3) ~ 오늘(0)까지 데이터 생성
    for (let i = -3; i <= 0; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      
      days.push({
        dateObj: d,
        dateStr: d.toISOString().split('T')[0], // YYYY-MM-DD
        dayName: DAY_NAMES[d.getDay()],         // SUN, MON...
        dayIndex: d.getDay(),                   // 0(일) ~ 6(토)
        dayNum: d.getDate(),
        isToday: i === 0,
        // 가짜 데이터 로직 (오늘 제외, 과거는 기록이 있다고 가정)
        hasRecord: i !== 0, 
        emotion: i === 0 ? null : (i === -1 ? '😊' : (i === -2 ? '☁️' : '😐')), 
        score: i === 0 ? null : (i === -1 ? 8.5 : (i === -2 ? 4.0 : 6.0)),
      });
    }
    setWeekDays(days);
  }, []);

  // --- 데이터 필터링 ---
  
  // 1. 최근 감정 리스트 (오늘 제외, 과거 기록만 역순으로 정렬 등)
  const recentEmotions = useMemo(() => {
    return weekDays
      .filter(day => !day.isToday && day.emotion) // 오늘 아니고, 감정 있는 날
      .sort((a, b) => b.dateObj - a.dateObj);     // 최신순 정렬 (선택사항)
  }, [weekDays]);

  // 2. 오늘 날짜 정보 (CTA 버튼용)
  const todayData = useMemo(() => {
    return weekDays.find(day => day.isToday);
  }, [weekDays]);

  // --- 핸들러 ---
  const handleWriteClick = () => {
    // 오늘 날짜로 글쓰기 페이지 이동
    const dateStr = todayData ? todayData.dateStr : new Date().toISOString().split('T')[0];
    navigate(`/write-option?date=${dateStr}`);
  };

  return (
    <div className="home-weekly-container">

      {/* 헤더: 로고 */}
      <header className="weekly-header">
        <img src={logo} alt="MoodTrack Logo" className="app-logo" />
      </header>

      {/* 1️⃣ 프로필 카드 */}
      <section className="card profile-card">
        <p className="profile-nickname">{nickname} 님,</p>
        <p className="profile-greeting">{greeting}</p>
        <p className="profile-streak">
          <strong>{streak}</strong>일째 연속 출석 중!
        </p>
        <p className="profile-points">
          🅿️ {points} 포인트
        </p>
      </section>

      {/* 2️⃣ 이번 주 출석 현황 */}
      <section className="card">
        <p className="section-title">
          이번 주 기록 현황
        </p>

        <div className="week-check">
          {DAY_NAMES_KO.map((dayName, index) => {
            // weekDays 데이터 중에 해당 요일(index)이 있고, 기록(hasRecord)이 있는지 확인
            const recordExists = weekDays.some(d => d.dayIndex === index && d.hasRecord);
            
            return (
              <div key={index} className={`day-circle ${recordExists ? 'checked' : ''}`}>
                 {/* 기록이 있으면 체크, 없으면 요일 표시 */}
                {recordExists ? '✓' : dayName}
              </div>
            );
          })}
        </div>
      </section>

      {/* 3️⃣ 최근 감정 리스트 */}
      <section className="card">
        <p className="section-title">
          최근의 감정들을 한눈에 돌아보세요
        </p>

        <div className="emotion-list vertical">
          {recentEmotions.length > 0 ? (
            recentEmotions.map((day) => (
              <div key={day.dateStr} className="emotion-card vertical">
                {/* 날짜 */}
                <span className="emotion-date">
                  {day.dayName} {day.dayNum}
                </span>

                {/* 감정 이모지 */}
                <span className="emotion-emoji">
                  {day.emotion}
                </span>

                {/* 점수 */}
                <span className="emotion-score">
                  {day.score}점
                </span>
              </div>
            ))
          ) : (
            <div className="no-record-message">아직 기록된 감정이 없어요.</div>
          )}
        </div>
      </section>

      {/* 4️⃣ 기록하기 CTA (오늘) */}
      <section
        className="card cta-card"
        onClick={handleWriteClick}
      >
        <span>오늘 하루는 어땠나요?</span>
        <strong>기록하러 가기 ▶</strong>
      </section>

    </div>
  );
};

export default HomeWeekly;
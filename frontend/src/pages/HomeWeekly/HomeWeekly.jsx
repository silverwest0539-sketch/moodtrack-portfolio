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

    const fetchWeekly = async () => {
      const res = await fetch(
        'http://localhost:3000/api/diary/weekly',
        { credentials: 'include' }
      );
      const data = await res.json();

      const diaryMap = {};
      data.diaries.forEach(d => {
        const localDate = new Date(d.DIARY_DATE);
        const yyyy = localDate.getFullYear();
        const mm = String(localDate.getMonth() + 1).padStart(2, '0');
        const dd = String(localDate.getDate()).padStart(2, '0');
        const dateKey = `${yyyy}-${mm}-${dd}`;

        diaryMap[dateKey] = d.EMO_SCORE;
      });

      const today = new Date();
      const days = [];

      for (let i = -3; i <= 0; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i)

        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;

        const score = diaryMap[dateStr];

        days.push({
          dateObj: d,
          dateStr,
          dayName: getDayName(d.getDay()),
          dayNum: d.getDate(),
          isToday: i === 0,
          score,
          emotion: score ? getEmoji(score) : null
        });
      }

      setWeekDays(days);
    };

    fetchWeekly();
  }, []);

  const getEmoji = (score) => {
    if (score >= 70) return '😊'
    if (score >= 40) return '😐'
    return '☁️';
  }

  const getDayName = (dayIndex) => {
    const names = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return names[dayIndex];
  };

  // handleCardClick 함수 내부 수정
  const handleCardClick = (day) => {
    if (day.isFuture) { /* ... */ return; }

    // [변경] prompt -> write-option
    navigate(`/write-option?date=${day.dateStr}`);
  }

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
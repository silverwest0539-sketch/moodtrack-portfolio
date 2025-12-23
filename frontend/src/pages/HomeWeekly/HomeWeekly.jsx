// src/pages/HomeWeekly/HomeWeekly.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomeWeekly.css';

const HomeWeekly = () => {
  const navigate = useNavigate();
  const [weekDays, setWeekDays] = useState([]);

  useEffect(() => {
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

  };

  return (
    <div className="home-weekly-container">
      {/* 1. 상단 헤더 (여백 줄임) */}
      <header className="weekly-header">
        <h2>{new Date().getFullYear()}년 {new Date().getMonth() + 1}월</h2>
        <p className="subtitle">오늘 당신의 마음 온도는?</p>
      </header>

      {/* 2. 카드 리스트 영역 */}
      <div className="day-list">
        {weekDays.map((day) => (
          <div
            key={day.dateStr}
            className={`day-card ${day.isToday ? 'today-main' : 'past-small'}`}
            onClick={() => handleCardClick(day)}
          >
            {/* 날짜 정보 */}
            <div className="date-info">
              <span className={`day-name ${day.dayName === 'SUN' ? 'sun' : day.dayName === 'SAT' ? 'sat' : ''}`}>
                {day.dayName}
              </span>
              <span className="day-num">{day.dayNum}</span>
            </div>

            {/* 내용 영역 */}
            <div className="card-content">
              {day.isToday ? (
                // [오늘] 큰 화면 구성
                <div className="today-content">
                  <span className="today-label">Today's Record</span>
                  <span className="today-cta">오늘 하루를 기록해보세요 ✍️</span>
                </div>
              ) : (
                // [과거] 작게 한 줄로 표시
                <div className="past-content">
                  {day.emotion ? (
                    <>
                      <span className="emoji">{day.emotion}</span>
                      <span className="score">{day.score}점</span>
                    </>
                  ) : (
                    <span className="no-record-dot"></span>
                  )}
                </div>
              )}
            </div>

            {/* 아이콘 */}
            <div className="action-icon">
              {day.isToday ? '✏️' : '✅'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeWeekly;
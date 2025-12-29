// src/components/layout/BottomNav.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './BottomNav.css';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [weekDays, setWeekDays] = useState([]);

  useEffect(() => {
    const fetchWeekly = async () => {
      try {
        const res = await fetch(
          'http://localhost:3000/api/emotion-stats/week-full',
          { credentials: 'include' }
        )
        const data = await res.json()

        if (!data.success) {
          console.error('주간 데이터 조회 실패')
          return
        }

        const days = data.diaries.map(diary => {
          const dateStr = diary.DIARY_DATE;
          const [year, month, day] = dateStr.split('-');
          const date = new Date(year, month - 1, day);

          return {
            dateStr: diary.DIARY_DATE,
            isToday: isToday(date),
            score: diary.EMO_SCORE,
          };
        });

        setWeekDays(days);
      } catch (error) {
        console.error('주간 데이터 조회 에러:', error);
      }
    };

    fetchWeekly();
  }, []);

  const isToday = (date) => {
    const today = new Date()
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
  }

  // 오늘 날짜 문자열 (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];

  const handleWriteClick = () => {

    const todayData = weekDays.find(d => d.isToday)

    if (!todayData) {
      const today = new Date()
      const dateStr = today.toISOString().split('T')[0]
      navigate(`/write-option?date=${dateStr}`)
      return
    }

    if (todayData.score) {
      alert('오늘은 이미 기록을 남기셨어요!')
      navigate(`/diary-view?date=${todayData.dateStr}`, {
        state: {
          date: todayData.dateStr.replace(/-/g, '.'),
          score: todayData.score,
          emotion: todayData.emotion,
        }
      })
    } else {
      navigate(`/write-option?date=${todayData.dateStr}`)
    }
  };

  return (
    <nav className="bottom-nav-container">
      {/* 왼쪽 메뉴 */}
      <button
        className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
        onClick={() => navigate('/')}
      >
        <span>🏠</span>
        <span className="label">홈</span>
      </button>

      <button
        className={`nav-item ${location.pathname === '/main' ? 'active' : ''}`}
        onClick={() => navigate('/main')}
      >
        <span>📆</span>
        <span className="label">캘린더</span>
      </button>



      {/* 오른쪽 메뉴 */}


      <button
        className={`nav-item ${location.pathname === '/emotion-stats' ? 'active' : ''}`}
        // 기존 MainCalendar(전체달력)를 '/stats' 라우트에 연결하거나 별도 Stats 페이지 연결
        onClick={() => navigate('/emotion-stats')}
      >
        <span>📊</span>
        <span className="label">통계</span>
      </button>

      <button
        className={`nav-item ${location.pathname === '/my' ? 'active' : ''}`}
        onClick={() => navigate('/my')}
      >
        <span>👤</span>
        <span className="label">MY</span>
      </button>
    </nav>
  );
};

export default BottomNav;
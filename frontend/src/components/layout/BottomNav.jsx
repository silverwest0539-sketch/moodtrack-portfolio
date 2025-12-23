// src/components/layout/BottomNav.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './BottomNav.css';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 오늘 날짜 문자열 (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];

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


      {/* 중앙 플로팅 버튼 (오늘의 일기 쓰기) */}
      <div className="nav-center">
        <button 
            className="fab-write-btn"
            // [변경] prompt -> write-option
            onClick={() => navigate(`/write-option?date=${todayStr}`)}
        >
            ✏️
        </button>
      </div>

      {/* 오른쪽 메뉴 */}
      

      <button 
        className={`nav-item ${location.pathname === '/emotionstats' ? 'active' : ''}`}
        // 기존 MainCalendar(전체달력)를 '/stats' 라우트에 연결하거나 별도 Stats 페이지 연결
        onClick={() => navigate('/emotionstats')} 
      >
        <span>📊</span>
        <span className="label">통계</span>
      </button>

      <button 
        className={`nav-item ${location.pathname === '/mypage' ? 'active' : ''}`}
        onClick={() => navigate('/mypage')}
      >
        <span>👤</span>
        <span className="label">MY</span>
      </button>
    </nav>
  );
};

export default BottomNav;
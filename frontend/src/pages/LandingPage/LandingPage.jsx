// 첫 화면 (로그인, 회원가입)

import React from 'react';
import './LandingPage.css'; // 바로 아래에서 만들 CSS
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();
  const handleLogin = () => {
    // 나중에 여기서 navigate('/login') 같은 거 붙이면 됨
    console.log('로그인 클릭!');
    navigate('/login')
  };

  const handleSignup = () => {
    console.log('회원가입 클릭!');
    navigate('/signup')
  };

  return (
    <div id="landing-page">
      {/* 애니메이션 스테이지 */}
      <div className="animation-stage">
        {/* 슬로건 텍스트 */}
        <div className="slogan-container">
          <h1 className="slogan-text">
            오늘 당신의
            <br />
            마음 온도는 몇 도인가요?
          </h1>
        </div>

        {/* 나무 SVG */}
        <svg
          className="tree-svg"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 땅 */}
          <ellipse
            cx="100"
            cy="190"
            rx="60"
            ry="10"
            fill="#4a3b32"
            opacity="0.5"
          />

          {/* 줄기 + 가지 */}
          <g className="trunk-group">
            <path
              d="M95 190 L95 100 L105 100 L105 190 Z"
              fill="#8B5A2B"
            />
            <path
              d="M100 130 L80 110"
              stroke="#8B5A2B"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M100 120 L120 100"
              stroke="#8B5A2B"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </g>

          {/* 나뭇잎 */}
          <g className="leaves-group">
            <circle cx="100" cy="90" r="25" fill="#4CAF50" />
            <circle cx="80" cy="100" r="20" fill="#66BB6A" />
            <circle cx="120" cy="100" r="20" fill="#66BB6A" />
            <circle cx="100" cy="70" r="20" fill="#81C784" />
            <circle cx="75" cy="80" r="15" fill="#A5D6A7" />
            <circle cx="125" cy="80" r="15" fill="#A5D6A7" />
          </g>
        </svg>
      </div>

      {/* 하단 버튼 영역 */}
      <div className="auth-actions">
        <button
          id="btn-login"
          className="btn-primary-outline"
          onClick={handleLogin}
        >
          로그인
        </button>
        <button
          id="btn-signup"
          className="btn-primary-fill"
          onClick={handleSignup}
        >
          회원가입
        </button>
      </div>
    </div>
  );
}

export default LandingPage;

// src/pages/MyPage/MyPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyPage.css";

function MyPage() {
  const navigate = useNavigate();

  // 데모용: 추후 백엔드/전역상태(AuthContext 등)로 교체
  const [nickname] = useState("45정");
  const [streak] = useState(2);
  const [points] = useState(120);

  const [userId] = useState("moodtrack_4510");
  const [email] = useState("user@example.com");

  const handleEditProfile = () => {
    // 추후 회원정보 수정 페이지 연결
    navigate("/my/edit");
    
  };

  const showNav = ""

  const handleLogout = () => {
    // 추후: 서버 로그아웃 API 호출 + 토큰/쿠키 제거 + 상태 초기화
    // await axios.post("/api/auth/logout", ...)

    alert("로그아웃 되었습니다. (데모)");
    navigate("/login");
  };

  console.log("pathname:", location.pathname, "showNav:", showNav);
  return (
    <div className="my-container">
      {/* 1) 프로필 카드 (랜덤 인사말 제외) */}
      <section className="my-card my-profile-card">
        <p className="my-nickname">{nickname} 님,</p>

        <p className="my-streak">
          <strong>{streak}</strong>일째 연속 출석 중!
        </p>

        <p className="my-points">
          <span className="my-point-icon">🅿️</span>
          <span>{points} 포인트</span>
        </p>
      </section>

      {/* 2) 회원정보 카드 */}
      <section className="my-card my-info-card">
        <div className="my-card-header">
          <h3 className="my-card-title">회원정보</h3>
          <button type="button" className="my-edit-btn" onClick={handleEditProfile}>
            수정하기
          </button>
        </div>

        <div className="my-info-row">
          <span className="my-info-label">아이디</span>
          <span className="my-info-value">{userId}</span>
        </div>

        <div className="my-divider" />

        <div className="my-info-row">
          <span className="my-info-label">이메일</span>
          <span className="my-info-value">{email}</span>
        </div>
      </section>

      {/* 3) 로그아웃 */}
      <section className="my-card my-logout-card">
        <button type="button" className="my-logout-btn" onClick={handleLogout}>
          로그아웃
        </button>
      </section>
    </div>
  );
}

export default MyPage;
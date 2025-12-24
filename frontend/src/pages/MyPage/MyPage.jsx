// src/pages/MyPage/MyPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyPage.css";

function MyPage() {
  const navigate = useNavigate();

  const [nickname] = useState("45정");
  const [streak] = useState(2);
  const [points] = useState(120);

  const [userId] = useState("moodtrack_4510");
  const [email] = useState("user@example.com");

  const handleEditProfile = () => {
    navigate("/my/edit");
  };

  const handleLogout = () => {
    alert("로그아웃 되었습니다. (데모)");
    navigate("/login");
  };

  // ✅ 회원탈퇴 (데모)
  const handleWithdraw = () => {
    const ok = window.confirm("정말 회원탈퇴 하시겠어요? 이 작업은 되돌릴 수 없습니다.");
    if (!ok) return;

    // TODO: 백엔드 연동 시 탈퇴 API 호출 + 세션/토큰 정리
    alert("회원탈퇴가 완료되었습니다. (데모)");
    navigate("/landing");
  };

  return (
    <div className="my-container">
      {/* 1) 프로필 카드 */}
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

      {/* 3) 로그아웃 + 회원탈퇴하기 */}
      <section className="my-card my-logout-card">
        <button type="button" className="my-logout-btn" onClick={handleLogout}>
          로그아웃
        </button>

        {/* ✅ 로그아웃 아래 작은 링크 */}
        <button type="button" className="my-withdraw-link" onClick={handleWithdraw}>
          회원탈퇴하기
        </button>
      </section>
    </div>
  );
}

export default MyPage;
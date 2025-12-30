// src/pages/MyPage/MyPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"
import "./MyPage.css";

function MyPage() {
  const navigate = useNavigate();

  const [nickname, setNickname] = useState('')
  const [streak, setStreak] = useState(0)
  const [loginid, setLoginid] = useState('')
  const [email, setEmail] = useState('')
  const [points] = useState(120)


  const handleEditProfile = () => {
    navigate("/my/edit");
  };

  const handleLogout = async () => {
  try {
    await axios.post(
      "http://localhost:3000/api/auth/logout",
      {},
      { withCredentials: true }
    );

    alert("로그아웃이 완료되었습니다.");
    window.location.href = "/";
  } catch (err) {
    console.error(err);
    alert("로그아웃 중 오류가 발생했습니다.");
  }
  };

  // ✅ 회원탈퇴 (데모)
  const handleWithdraw = async () => {
      const ok = window.confirm(
    "정말 회원탈퇴 하시겠어요?\n모든 일기가 영구적으로 삭제됩니다."
  );
  if (!ok) return;

  try {
    await axios.delete(
      "http://localhost:3000/api/auth/withdraw",
      { withCredentials: true }
    );

    alert("회원탈퇴가 완료되었습니다.");
    window.location.href = "/"
  } catch (err) {
    console.error(err);
    alert("회원탈퇴 중 오류가 발생했습니다.");
  }
  };

  useEffect(() => {

    // 사용자 프로필 조회
    const fetchUserProfile = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/user/profile',
          { credentials: 'include' }
        )
        const data = await res.json()

        if (data.success) {
          setNickname(data.nickname)
          setStreak(data.streak)
          setLoginid(data.loginid)
          setEmail(data.email)
        } else {
          console.error('프로필 조회 실패:', data.message)
          setNickname(data.nickname)
          setStreak(0)
          setLoginid(data.loginid)
          setEmail(data.email)
        }
      } catch (error) {
        console.error('프로필 조회 에러:', error)
        setNickname('사용자')
        setStreak(0)
        setLoginid(data.loginid)
        setEmail(data.email)
      }
    }

    fetchUserProfile();
  }, [])

  return (
    <div className="my-container">
      {/* 1) 프로필 카드 */}
      <section className="my-card my-profile-card">
        <p className="my-nickname">{nickname ? `${nickname}님,` : '로딩 중...'}</p>

        <p className="my-streak">
          <strong>{streak}</strong>일째 연속 출석 중!
        </p>

        {/* <p className="my-points">
          <span className="my-point-icon">🅿️</span>
          <span>{points} 포인트</span>
        </p> */}
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
          <span className="my-info-value">{loginid}</span>
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
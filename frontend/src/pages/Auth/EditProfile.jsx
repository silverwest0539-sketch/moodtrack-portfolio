// src/pages/Auth/EditProfile.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const EditProfile = () => {
  const navigate = useNavigate();

  // 데모용 초기값 (추후 백엔드/전역상태에서 채우기)
  const [nickname, setNickname] = useState('45정');
  const [userId, setUserId] = useState('moodtrack_4510');
  const [email, setEmail] = useState('user@example.com');

  // 비밀번호 변경 UI를 유지할지/제거할지 팀 합의에 따라 선택
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');

  // 이메일 인증 흐름도 Signup과 동일하게 유지 (필요 시)
  const [authCode, setAuthCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(true); // 수정 페이지는 기본 인증 완료로 두는 경우 많음

  // (선택) 수정 페이지 진입 시 서버에서 회원정보 받아오는 자리
  useEffect(() => {
    // TODO: fetch/axios로 내 정보 불러와 setNickname/setUserId/setEmail
  }, []);

  const sendAuthCode = () => {
    if (!email) {
      alert('이메일을 입력해주세요!');
      return;
    }
    const generateCode = Math.floor(100000 + Math.random() * 900000).toString();
    setAuthCode(generateCode);
    setIsCodeSent(true);
    alert(`인증번호가 발송되었습니다. (테스트 코드: ${generateCode})`);
  };

  const verifyAuthCode = () => {
    if (inputCode === authCode) {
      alert('이메일 인증이 완료되었습니다!');
      setIsEmailVerified(true);
    } else {
      alert('인증번호가 올바르지 않습니다.');
    }
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (password && password !== password2) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    // TODO: 서버에 수정 저장 API 호출
    alert('회원정보가 저장되었습니다! (데모)');
    navigate('/my');
  };

  const handleWithdraw = () => {
    const ok = window.confirm('정말 회원탈퇴 하시겠어요? 이 작업은 되돌릴 수 없습니다.');
    if (!ok) return;

    // TODO: 서버에 탈퇴 API 호출 + 로그아웃 처리
    alert('회원탈퇴가 완료되었습니다. (데모)');
    navigate('/landing');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <header className="auth-header">
          <h1 className="auth-title">Edit Profile</h1>
          <p className="auth-subtitle">회원정보를 수정할 수 있어요.</p>
        </header>

        <form className="auth-form" onSubmit={handleSave}>
          {/* 닉네임 */}
          <div className="input-group">
            <input
              type="text"
              placeholder="닉네임 (나를 부를 이름)"
              className="custom-input"
              required
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>

          {/* 아이디 (보통 수정 불가 → disabled 추천) */}
          <div className="input-group">
            <input
              type="text"
              placeholder="아이디"
              className="custom-input"
              required
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              disabled
            />
          </div>

          {/* 비밀번호 / 비밀번호 확인 (선택) */}
          <div className="input-group">
            <input
              type="password"
              placeholder="새 비밀번호 (선택)"
              className="custom-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="새 비밀번호 확인 (선택)"
              className="custom-input"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
            />
          </div>

          {/* 이메일 + 인증 (Signup과 동일 UX 유지 가능) */}
          <div className="input-group email-group">
            <input
              type="email"
              placeholder="이메일"
              className="custom-input"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setIsEmailVerified(false); // 이메일이 바뀌면 재인증 필요로 처리
              }}
              disabled={false}
            />
            <button
              type="button"
              className="btn-auth-small"
              onClick={sendAuthCode}
              disabled={isEmailVerified}
            >
              인증번호 발송
            </button>
          </div>

          {isCodeSent && !isEmailVerified && (
            <div className="input-group email-group">
              <input
                type="text"
                placeholder="인증번호 입력"
                className="custom-input"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
              />
              <button
                type="button"
                className="btn-auth-small"
                onClick={verifyAuthCode}
              >
                확인
              </button>
            </div>
          )}

          {/* ✅ 하단 버튼 2개 나란히 */}
          <div className="btn-row">
            <button
              type="button"
              className="btn-auth-submit btn-danger"
              onClick={handleWithdraw}
            >
              회원탈퇴
            </button>
            <button type="submit" className="btn-auth-submit">
              수정저장
            </button>
          </div>
        </form>

        {/* 수정 페이지에서는 로그인 유도 footer 제거(원하면 "MY로 돌아가기"로 대체 가능) */}
        <div className="auth-footer">
          <span className="link-text" onClick={() => navigate('/my')}>MY로 돌아가기</span>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
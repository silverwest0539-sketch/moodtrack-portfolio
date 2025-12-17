// src/pages/Auth/Signup.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Signup = () => {
    const navigate = useNavigate();
    // 수정 시작

    // [추가 1] 아이디를 저장할 변수 만들기
    const [userId, setUserId] = useState('');
    // 닉네임 입력값도 관리하려면 아래 줄도 필요 
    const [nickname, setNickname] = useState(''); 


    const [email, setEmail] = useState('')
    const [authCode, setAuthCode] = useState('')
    const [inputCode, setInputCode] = useState('')

    const [isCodeSent, setIsCodeSent] = useState(false)
    const [isEmailVerified, setIsEmailVerified] = useState(false)
    const [isCodeVerified, setIsCodeVerified] = useState(false)

    // 인증번호 발송
    const sendAuthCode = () => {
        if (!email) {
            alert('이메일을 입력해주세요!')
            return;
        }

        const generateCode = Math.floor(100000 + Math.random() * 900000).toString()

        setAuthCode(generateCode)
        setIsCodeSent(true)

        alert(`인증번호가 발송되었습니다. (테스트 코드: ${generateCode})`)
    }

    // 인증번호 확인
    const verifyAuthCode = () => {
        if (inputCode === authCode) {
            alert('이메일 인증이 완료되었습니다!')
            setIsEmailVerified(true)
            setIsCodeVerified(true)
        } else {
            alert('인증번호가 올바르지 않습니다.')
        }
    }
    // 수정 끝
    const handleSignup = (e) => {
        e.preventDefault();
        alert("가입을 환영합니다! 🎉");
        navigate('/login');
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <header className="auth-header">
                    <h1 className="auth-title">Hello New! ✨</h1>
                    <p className="auth-subtitle">당신의 마음 온도를 기록해보세요.</p>
                </header>

                <form className="auth-form" onSubmit={handleSignup}>

                    <div className="input-group">
                        <input type="text" placeholder="닉네임 (나를 부를 이름)" className="custom-input" required />
                    </div>

                    {/* [추가 2] 맨 윗줄: 아이디 입력 칸 */}
                    <div className="input-group">
                        <input 
                            type="text" 
                            placeholder="아이디" 
                            className="custom-input" 
                            required 
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <input type="password" placeholder="비밀번호" className="custom-input" required />
                    </div>
                    <div className="input-group">
                        <input type="password" placeholder="비밀번호 확인" className="custom-input" required />
                    </div>


                    <div className="input-group email-group">
                        <input type="email"
                            placeholder="이메일"
                            className="custom-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isEmailVerified}
                        />
                        <button
                            type="button"
                            className="btn-auth-small"
                            onClick={sendAuthCode}
                            disabled={isEmailVerified}>
                            인증번호 발송
                        </button>
                    </div>
                    {isCodeSent && (
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
                                disabled={isCodeVerified}>
                                확인
                            </button>
                        </div>
                        )}
                    

                    <button type="submit" className="btn-auth-submit">회원가입 완료</button>
                </form>

                <div className="auth-footer">
                    이미 계정이 있으신가요?
                    <span className="link-text" onClick={() => navigate('/login')}>로그인</span>
                </div>
            </div>
        </div>
    );
};

export default Signup;
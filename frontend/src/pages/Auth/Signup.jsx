// src/pages/Auth/Signup.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Signup = () => {
    const navigate = useNavigate();

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
                    <div className="input-group">
                        <input type="email" placeholder="이메일" className="custom-input" required />
                    </div>
                    <div className="input-group">
                        <input type="password" placeholder="비밀번호" className="custom-input" required />
                    </div>
                    <div className="input-group">
                        <input type="password" placeholder="비밀번호 확인" className="custom-input" required />
                    </div>
                    
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
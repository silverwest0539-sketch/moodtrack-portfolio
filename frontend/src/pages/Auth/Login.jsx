// src/pages/Auth/Login.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css'; // 스타일 공유

const Login = () => {
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // 로그인 로직 처리 후 메인으로 이동
        navigate('/');
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <header className="auth-header">
                    <h1 className="auth-title">Welcome Back! 👋</h1>
                    <p className="auth-subtitle">오늘 당신의 하루는 어땠나요?</p>
                </header>

                <form className="auth-form" onSubmit={handleLogin}>
                    <div className="input-group">
                        <input type="email" placeholder="이메일" className="custom-input" required />
                    </div>
                    <div className="input-group">
                        <input type="password" placeholder="비밀번호" className="custom-input" required />
                    </div>
                    
                    <button type="submit" className="btn-auth-submit">로그인</button>
                </form>

                <div className="divider"><span>또는 소셜 로그인</span></div>

                <div className="social-login-box">
                    <button className="social-btn kakao">💬</button>
                    <button className="social-btn google">G</button>
                </div>

                <div className="auth-footer">
                    아직 계정이 없으신가요? 
                    <span className="link-text" onClick={() => navigate('/signup')}>회원가입</span>
                </div>
            </div>
        </div>
    );
};

export default Login;
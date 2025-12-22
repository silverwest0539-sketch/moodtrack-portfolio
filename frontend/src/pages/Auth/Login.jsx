// src/pages/Auth/Login.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Auth.css'; // 스타일 공유
import { useAuth } from '../../auth/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { refreshAuth } = useAuth();

    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(
                'http://localhost:3000/api/auth/login',
                { loginId, password },
                { withCredentials: true } // ⭐ 세션 쿠키 받기
            );

            if (res.data.success) {
                await refreshAuth();
                alert('로그인 성공!');
                navigate('/', { replace: true });
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || '로그인 실패');
        }
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
                        <input 
                          type="text"
                          placeholder="아이디"
                          className="custom-input"
                          value={loginId}
                          onChange={(e) => setLoginId(e.target.value)}
                          required
                        />
                    </div>
                    <div className="input-group">
                        <input 
                          type="password"
                          placeholder="비밀번호"
                          className="custom-input"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                    </div>
                    
                    <button type="submit" className="btn-auth-submit">로그인</button>
                </form>

                <div className="divider"><span>또는 소셜 로그인</span></div>

                <div className="social-login-box">
                    <button className="social-btn kakao" onClick={() => {window.location.href = 'http://localhost:3000/api/auth/kakao'}}>💬</button>
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
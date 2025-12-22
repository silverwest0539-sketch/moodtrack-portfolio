// src/pages/Auth/Signup.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const Signup = () => {
    const navigate = useNavigate();

    // 모드 판별 (소셜 로그인 관련)
    const [searchParams] = useSearchParams();
    const isKakaoMode = searchParams.get('mode') === 'kakao';

    useEffect(() => {
    if (!isKakaoMode) return;

    axios.get('http://localhost:3000/api/auth/kakao/pending', {
        withCredentials: true
    }).then(res => {
        if (res.data.success) {
        setNickname(res.data.nickname || '');
        }
    }).catch(() => {
        navigate('/login');
    });
    }, [isKakaoMode, navigate]);

    // 수정 시작

    // [추가 1] 아이디를 저장할 변수 만들기
    const [loginId, setLoginId] = useState('');
    // 닉네임 입력값도 관리하려면 아래 줄도 필요 
    const [nickname, setNickname] = useState(''); 
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');


    const [email, setEmail] = useState('')
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

        axios.post('http://localhost:3000/api/auth/sendAuthCode', {email})
        .then((res)=>{
            if (res.data.success) {
                alert(res.data.message)
                setIsCodeSent(true)
            } else {
                alert(res.data.message)
            }
        })
        .catch((error)=>{
            console.error('에러:', error)
            alert('서버 연결에 실패했습니다.')
        })
    }

    // 인증번호 확인
    const verifyAuthCode = () => {
        axios.post('http://localhost:3000/api/auth/verifyAuthCode', {
            email,
            code: inputCode
        })
        .then((res)=>{
            if (res.data.success) {
                alert(res.data.message)
                setIsEmailVerified(true)
                setIsCodeVerified(true)
            } else {
                alert(res.data.message)
            }
        })
        .catch((error)=>{
            console.error('에러:', error)
            alert('서버 연결에 실패했습니다.')
        })
    }
    
    const handleSignup = async (e) => {
        e.preventDefault();


         // 카카오 회원가입
        if (isKakaoMode) {
            if (!nickname.trim()) {
            alert('닉네임을 입력해주세요');
            return
            }
        
          if (!isEmailVerified) {
            alert('이메일 인증을 완료해주세요');
            return;
        }

        try {
        const res = await axios.post(
            'http://localhost:3000/api/auth/kakao/complete',
        {
          email: email.trim(),
          nickname: nickname.trim()
        },
        { withCredentials: true }
      );

        if (res.data.success) {
            navigate('/');
        } else {
            alert(res.data.message);
        }
        } catch (err) {
        alert('카카오 회원가입 실패');
        }
        return;
    }


         try {
        const response = await axios.post("http://localhost:3000/api/auth/signup", {
            loginId: loginId,
            email: email,
            password: password,
            confirmPassword: confirmPassword,
            nickname: nickname
        });

        if (response.data.success) {
            alert("가입을 환영합니다! 🎉");
            navigate('/login');
        } else {
            alert(response.data.message);
        }
    } catch (error) {
        console.error(error);
        alert("회원가입 중 오류 발생!");
    }

        // 이메일 인증 확인
        if (!isEmailVerified) {
            alert('이메일 인증을 완료해주세요')
            return
        }
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
                        <input 
                        type="text" 
                        placeholder="닉네임 (나를 부를 이름)" 
                        className="custom-input" 
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        required />
                    </div>

                    {/* [추가 2] 맨 윗줄: 아이디 입력 칸 */}
                    {!isKakaoMode && (
                        <>
                    <div className="input-group">
                        <input 
                            type="text" 
                            placeholder="아이디" 
                            className="custom-input" 
                            required 
                            value={loginId}
                            onChange={(e) => setLoginId(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <input
                         type="password" 
                        placeholder="비밀번호" 
                        className="custom-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required />
                    </div>
                    <div className="input-group">
                        <input 
                        type="password" 
                        placeholder="비밀번호 확인" 
                        className="custom-input"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required />
                    </div>


                        </>
                        )}

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
// controllers/authController.js
const bcrypt = require('bcryptjs');
const pool = require('../server/config/database');
const transporter = require('../server/config/emailConfig')
const kakaoConfig = require('../server/config/kakaoConfig')
const axios = require('axios')



// 회원가입
exports.signup = async (req, res) => {
    console.log('📦 req.body:', req.body);
  try {
    const { loginId, email, password, confirmPassword, nickname } = req.body;

    // 1) 필수값 체크
    if (!loginId || !email || !password || !confirmPassword || !nickname) {
      return res.status(400).json({
        success: false,
        message: '필수 항목을 모두 입력해 주세요.',
      });
    }

    // 2) ID 규칙 검사 (영어 + 숫자만)
    const idRegex = /^[a-zA-Z0-9]+$/;
    if (!idRegex.test(loginId)) {
      return res.status(400).json({
        success: false,
        message: '아이디는 영어와 숫자만 사용할 수 있습니다.',
      });
    }

    // 3) 비밀번호 규칙 검사 (예: 8자 이상, 영문/숫자 포함)
    const pwRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-={}[\]|;:'",.<>/?]{8,}$/;
    if (!pwRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          '비밀번호는 8자 이상, 영문과 숫자를 최소 1자 이상 포함해야 합니다.',
      });
    }

    // 4) 비밀번호 일치 확인
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: '비밀번호와 비밀번호 확인이 일치하지 않습니다.',
      });
    }

    // 5) ID / 이메일 중복 검사
    const [rows] = await pool.query(
      `
      SELECT user_id, login_id, email
      FROM USERS
      WHERE login_id = ? OR email = ?
      `,
      [loginId, email]
    );

    if (rows.length > 0) {
      const exists = rows[0];
      if (exists.login_id === loginId) {
        return res.status(400).json({
          success: false,
          message: '이미 사용 중인 아이디입니다.',
        });
      }
      if (exists.email === email) {
        return res.status(400).json({
          success: false,
          message: '이미 사용 중인 이메일입니다.',
        });
      }
    }

    // 6) 비밀번호 해시
    const hashedPassword = await bcrypt.hash(password, 10);

    // 7) 회원 정보 저장
    const [result] = await pool.query(
      `
      INSERT INTO USERS (login_id, email, password, nickname)
      VALUES (?, ?, ?, ?)
      `,
      [loginId, email, hashedPassword, nickname]
    );

    console.log('회원 가입 완료, insertId:', result.insertId);
    // 8) 성공 응답
    return res.status(201).json({
      success: true,
      message: '회원가입이 완료되었습니다.',
      data: {
        userId: result.insertId,
        loginId,
        email,
      },
    })
  } catch (error) {
    console.error('회원가입 에러:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
    });
  }
};

// 인증번호 임시 저장소
const authCodes = {};

// 이메일 인증번호 발송
exports.sendAuthCode = async (req,res)=>{
  try {
    const {email} = req.body
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: '이메일을 입력해주세요.',
      })
    }

    // 랜덤 인증번호 생성
    const authCode = Math.floor(100000 + Math.random()*900000).toString()

    // 인증번호 저장 (5분 후 자동 삭제)
    authCodes[email] = authCode
    setTimeout(()=>{
        delete authCodes[email]
    }, 5*60*1000)

    // 이메일 발송 설정
    const mailOptions = {
        from: 'silverwest0539@gmail.com',
        to: email,
        subject: 'MoodTrack 회원가입 인증번호',
        html: `
            <div style="padding: 20px; font-family: Arial, sans-serif;">
                <h2 style="color: #7F7FD5;">MoodTrack 이메일 인증</h2>
                <p>회원가입을 위한 인증번호입니다.</p>
                <div style="background: #f0f2f5; padding: 15px; border-radius: 10px; margin: 20px 0;">
                    <h1 style="color: #333; text-align: center; letter-spacing: 5px;">${authCode}</h1>
                </div>
                <p style="color: #666;">인증번호는 5분간 유효합니다.</p>
            </div>
        `        
    }

    // 이메일 발송
    transporter.sendMail(mailOptions, (err, rows)=>{
        if (err) {
            console.log('이메일 발송 실패:', err)
            return res.status(500).json({
              success: false,
              message: '이메일 발송에 실패했습니다.',
            })
        } else {
            console.log('이메일 발송 성공:', rows.response)
              return res.status(200).json({
              success: true,
              message: '인증번호가 발송되었습니다.',
            })
        }
    })
  } catch (error) {
    console.error('이메일 발송 에러: ', error)
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    })
  }
}

// 인증번호 확인
exports.verifyAuthCode = async (req,res)=>{
  try{
    const { email, code } = req.body

    if (!code) {
      return res.status(400).json({
        success: false,
        message: '인증번호를 입력해주세요.'
      })
    }

    if (authCodes[email] === code) {
      delete authCodes[email]
      return res.status(200).json({
        success: true,
        message: '인증이 완료되었습니다.'
      })
    } else {
      return res.status(400).json({
        success: false,
        message: '인증번호가 올바르지 않습니다.'
      })
    }
  } catch (error) {
    console.error('인증번호 확인 에러: ', error)
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    })
  }
}

// 로그인
exports.login = async (req, res) => {
  try {
    const { loginId, password } = req.body;

    // 1) 필수값 체크
    if (!loginId || !password) {
      return res.status(400).json({
        success: false,
        message: '아이디와 비밀번호를 모두 입력해 주세요.',
      });
    }

    // 2) 사용자 조회 (아이디 기준)
    const [rows] = await pool.query(
      `
      SELECT user_id, login_id, email, password, nickname
      FROM USERS
      WHERE login_id = ?
      `,
      [loginId]
    );

    if (rows.length === 0) {
      // 로그인 실패 메시지 (존재하지 않는 아이디)
      return res.status(400).json({
        success: false,
        message: '존재하지 않는 아이디입니다.',
      });
    }

    const user = rows[0];

    // 3) 비밀번호 비교
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // 로그인 실패 메시지 (비밀번호 불일치)
      return res.status(400).json({
        success: false,
        message: '비밀번호가 일치하지 않습니다.',
      });
    }

    // 🔥 세션에 저장
    req.session.user = {
      userId: user.user_id,
      loginId: user.login_id,
      email: user.email,
      nickname: user.nickname
    };

    // 4) 비밀번호 제거 후 응답
    delete user.password;

    return res.status(200).json({
      success: true,
      message: '로그인에 성공했습니다.',
      data: req.session.user,
    });

  } catch (error) {
    console.error('로그인 에러:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
    });
  }
};

// 로그인 유지 확인
exports.me = (req, res) => {
  if (req.session.user) {
    return res.json({
      isLoggedIn: true,
      user: req.session.user
    })
  }

  return res.status(401).json({
    isLoggedIn: false,
    user: null
  })
}

// 로그아웃
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('세션 삭제 오류:', err)
      return res.status(500).json({ success: false })
    }

    res.clearCookie('connect.sid')
    return res.json({ success: true, message: '로그아웃 되었습니다.' })
  })
}

// 회원탈퇴
exports.withdraw = async (req, res) => {
  let conn;
  const userId = req.session.user.userId;
  const kakaoToken = req.session.kakaoAccessToken;

  try {

  conn = await pool.getConnection();

  // 트랜잭션으로 묶기
  await conn.beginTransaction();

  if (kakaoToken) {
    await axios.post(
      'https://kapi.kakao.com/v1/user/unlink',
      {},
      {
        headers: {
           Authorization: `Bearer ${kakaoToken}`,
        },
      }
    );
  }

  const [result] = await conn.query(
    `DELETE FROM USERS WHERE USER_ID = ?`,
  [userId]
  );

  if (result.affectedRows === 0){
    await conn.rollback() // 잘못되면 되돌리기
    return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
  }

  await conn.commit();

  req.session.destroy(() => { // 세션에서 지우기
    return res.json({ success: true, message: '회원탈퇴 완료' });
  });

  } catch (err) {
    if (conn) await conn.rollback();
    console.error(err);
    return res.status(500).json({ success: false, message: '회원탈퇴 실패' });
  } finally {
    if (conn) conn.release();
  }
}

// 카카오 로그인
exports.kakaoAuth = (req, res) => {
  try {
    if (!kakaoConfig.CLIENT_ID || !kakaoConfig.REDIRECT_URI) {
      return res.status(500).json({
        success: false,
        message: '환경변수 설정 오류'
      });
    }

    const url = 
      `${kakaoConfig.AUTH_URL}` +
      `?client_id=${encodeURIComponent(kakaoConfig.CLIENT_ID)}` +
      `&redirect_uri=${encodeURIComponent(kakaoConfig.REDIRECT_URI)}` +
      `&response_type=code`;

    return res.redirect(url);
  } catch (err) {
    console.error('kakaoAuth error : ', err);
    return res.status(500).json({ success: false, message: '서버 오류' });
  }

};

// 카카오 콜백 함수
exports.kakaoCallback = async (req, res) => {
  const { code } = req.query;
  const axios = require('axios');

  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (!code) {
    return res.redirect(`${FRONTEND_URL}/login?error=kakao_no_code`);
  }

  try {
    // 토큰 요청
    const tokenRes = await axios.post(
      kakaoConfig.TOKEN_URL,
      new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: kakaoConfig.CLIENT_ID,
        redirect_uri: kakaoConfig.REDIRECT_URI,
        code
      }).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' } }
    );

    console.log('[KAKAO TOKEN RES]', tokenRes.data);

    const accessToken = tokenRes.data.access_token;
    req.session.kakaoAccessToken = accessToken;


    console.log('[KAKAO ACCESS TOKEN]', accessToken ? accessToken.slice(0, 10) + '...' : accessToken);

    
    if (!accessToken) {
      return res.status(500).json({
        success: false,
        message: '카카오 토큰 발급 실패 (access_token 없음)'
      });
    }

    // 사용자 정보 요청
    const meRes = await axios.get(kakaoConfig.USER_URL, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    console.log('[KAKAO ME RES]', meRes.data);

    const kakaoId = String(meRes.data.id);
    const kakaoAccount = meRes.data.kakao_account || {};
    const profile = kakaoAccount.profile || {};

    const email = kakaoAccount?.email || null;
    const nickname = profile.nickname || null;

    // 회원 조회
    const [rows] = await pool.query(
      `SELECT USER_ID, NICKNAME, PROVIDER, PROVIDER_USER_ID
       FROM USERS
       WHERE PROVIDER = 'kakao'
         AND PROVIDER_USER_ID = ?`,
      [kakaoId]
    );

    // 이미 회원이면 => 세션 로그인
    if (rows.length > 0) {
      const user = rows[0];
      req.session.user = {
        userId: user.USER_ID,
        nickname: user.NICKNAME,
        provider: user.PROVIDER,
        providerUserId: user.PROVIDER_USER_ID
      };

      return res.redirect(`${FRONTEND_URL}/`);
    }

    // 비회원이면 => 소셜 가입 플로우
    req.session.socialSignup = {
      provider: 'kakao',
      providerUserId: kakaoId,
      email,
      nickname
    };

    return res.redirect(`${FRONTEND_URL}/signup?mode=kakao`);
    } catch (err) {
      console.error('kakaoCallback error:', err.response?.data || err.message);
      return res.redirect(`${FRONTEND_URL}/login?error=kakao_fail`);
    }
}

// 비회원일 때 추가 정보 받아서 로그인

exports.kakaoComplete = async (req, res) => {
  try {
    const social = req.session.socialSignup;

    if (!social || social.provider !== 'kakao'){
      return res.status(401).json({
        success: false,
        message: '소셜 가입 세션이 만료되었습니다. 다시 시도해 주세요.'
      });
    }

    const { email, nickname } = req.body
    const { providerUserId } = social;
    
    // 이메일 중복 방지: 이미 사용 중인 EMAIL이면 막기
    const [dup] = await pool.query(
      `SELECT USER_ID FROM USERS WHERE EMAIL = ? LIMIT 1`,
      [email]
    );
    if (dup.length > 0) {
      return res.status(409).json({ success: false, message: '이미 사용 중인 이메일입니다.' });
    }

      // (1) 혹시 사이에 누가 가입했을 수도 있으니 한번 더 방어 조회
    const [exists] = await pool.query(
      `SELECT user_id, nickname, provider, provider_user_id
       FROM USERS
       WHERE provider='kakao' AND provider_user_id=?`,
      [providerUserId]
    );

    if (exists.length > 0) {
      req.session.user = {
        userId: exists[0].user_id,
        nickname: exists[0].nickname,
        provider: exists[0].provider,
        providerUserId: exists[0].provider_user_id
      };
      delete req.session.socialSignup;

      return res.json({ success: true, message: '이미 가입된 계정으로 로그인했습니다.' });
    }

    // 회원 생성
    const [result] = await pool.query(
      `INSERT INTO USERS (
        LOGIN_ID,
        EMAIL,
        PASSWORD,
        NICKNAME,
        PROVIDER,
        PROVIDER_USER_ID
      ) VALUES (
        NULL,
        ?,
        NULL,
        ?,
        'kakao',
        ?
      )`,
      [email, nickname, providerUserId]
    );

    const userId = result.insertId;

    // (3) 세션 로그인
    req.session.user = {
      userId,
      nickname: nickname.trim(),
      provider: 'kakao'
    };

    // (4) 임시 세션 제거
    delete req.session.socialSignup;

    return res.json({ success: true });
  } catch (err) {
    console.error('kakaoComplete error:', err);
    return res.status(500).json({ success: false, message: '서버 오류' });
  }
};

exports.getSocialPending = (req, res) => {
  const social = req.session.socialSignup;
  if (!social) {
    return res.status(401).json({ success: false });
  }

  return res.json({
    success: true,
    nickname: social.nickname || ''
  });
};


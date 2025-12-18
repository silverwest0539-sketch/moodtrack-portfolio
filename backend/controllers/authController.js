// controllers/authController.js
const bcrypt = require('bcryptjs');
const pool = require('../server/config/database');
const transporter = require('../server/config/emailConfig')


// 회원가입
exports.signup = async (req, res) => {
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
      FROM users
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
      INSERT INTO users (login_id, email, password, nickname)
      VALUES (?, ?, ?)
      `,
      [loginId, email, hashedPassword, nickname]
    );

    // 8) 성공 응답
    return res.status(201).json({
      success: true,
      message: '회원가입이 완료되었습니다.',
      data: {
        userId: result.insertId,
        loginId,
        email,
      },
    }), console.log(data);
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
      SELECT user_id, login_id, email, password
      FROM users
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

    // 4) 비밀번호 제거 후 응답
    delete user.password;

    // (선택) 세션 로그인이라면 여기서 req.session.user = user; 같은 거 세팅
    // req.session.user = { userId: user.user_id, loginId: user.login_id };

    return res.status(200).json({
      success: true,
      message: '로그인에 성공했습니다.',
      data: user,
    });
  } catch (error) {
    console.error('로그인 에러:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
    });
  }
};

// controllers/authController.js
const bcrypt = require('bcryptjs');
const pool = require('../server/config/database');

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

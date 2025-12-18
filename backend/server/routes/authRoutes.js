const express = require('express')
const router = express.Router();
const authController = require('../../controllers/authController')

// 회원가입
router.post('/signup', authController.signup);

// 이메일 인증번호 발송
router.post('/sendAuthCode', authController.sendAuthCode);

// 이메일 인증번호 확인
router.post('/verifyAuthCode', authController.verifyAuthCode);

// 로그인
router.post('/login', authController.login);

// 로그인 상태 확인
router.get('/me', authController.me)

// 로그아웃
router.post('/logout', authController.logout)

module.exports = router;
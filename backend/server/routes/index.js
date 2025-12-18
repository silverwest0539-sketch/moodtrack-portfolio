const express = require('express')
const router = express.Router()
const path = require('path')
const conn = require('../config/database')
const transporter = require('../config/emailConfig')

// 인증번호 임시 저장소
const authCodes = {}

// 메인 페이지
router.get('/', (req,res)=>{
    console.log('서버 접근!')
})

// 이메일 인증번호 발송
router.post('/sendAuthCode', (req,res)=>{
    const {email} = req.body
    
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
            res.json({ status: 500, message: '이메일 발송 실패'})
        } else {
            console.log('이메일 발송 성공:', rows.response)
            res.json({status: 200, message: '인증번호가 발송되었습니다.'})
        }
    })
})

// 인증번호 확인
router.post('/verifyAuthCode', (req,res)=>{
    const { email, code } = req.body

    if (authCodes[email] === code) {
        delete authCodes[email]
        res.json({ status: 200, message: '인증 성공'})
    } else {
        res.json({ status: 400, message: '인증번호가 올바르지 않습니다.'})
    }
})

module.exports = router;
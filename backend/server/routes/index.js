const express = require('express')
const router = express.Router()
const path = require('path')
const conn = require('../config/database')

// 메인 페이지
router.get('/', (req,res)=>{
    console.log('서버 접근!')
})

// 데이터 받아올 부분
router.post('/getData', (req,res)=>{
    console.log('getData Router', req.body)
    
    // nick 데이터를 DB에 넣어보자!
    let sql = "INSERT INTO DATA_TABLE VALUES (?)"

    conn.query(sql, [req.body.data], (err,rows)=>{
        console.log('rows', rows)
        if (rows) {
            // 요청에 대한 응답을 프론트로 넘겨주기
            res.json({ status: 200, nick: '닉네임' }) // 200 = 성공적인 상태
        } else {
            res.json({ status: 500 }) // 500 = rows가 존재하지 않음
        }
    })
})

module.exports = router;
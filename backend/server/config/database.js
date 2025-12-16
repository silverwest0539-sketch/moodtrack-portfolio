// DB와 연결하려면 mysql2 라는 모듈이 필요 
// 1) 설치 : npm i mysql2 
// 2) require
const mysql = require('mysql2')

// 3) DB 정보 기재 
const conn = mysql.createConnection({
    host : 'project-db-campus.smhrd.com',
    user : 'cgi_25K_donga1_p2_2',
    password : 'smhrd2', 
    port : 3307,
    database : 'cgi_25K_donga1_p2_2'
})

conn.connect()
module.exports = conn;
const express = require('express')
const app = express()
const cors = require('cors')
const cookieParser = require('cookie-parser')
const session = require('express-session')

const indexRouter = require('./routes/index')
const authRoutes = require('./routes/authRoutes')
const diaryRoutes = require('./routes/diaryRoutes')

// ⭐ 프론트(React: 5173)에서 오는 요청을 허용하고
// ⭐ 쿠키(세션 쿠키 포함)도 같이 주고받을 수 있도록 허용하는 설정
app.use(cors({
  origin: 'http://localhost:5173',  // 이 주소에서 오는 요청만 허용
  credentials: true,                // 클라이언트가 쿠키를 포함해서 요청할 수 있게 허용
}));

// ⭐ 브라우저가 보내는 쿠키를 읽을 수 있게 해주는 미들웨어
app.use(cookieParser());

// ⭐ express-session 설정 (로그인 유지의 핵심)
// 서버가 "세션 ID"를 만든 후, 그 값을 쿠키에 넣어 브라우저로 보내줌.
// 브라우저는 앞으로 요청할 때마다 이 세션 ID 쿠키를 같이 보냄.
// 서버는 "아~ 이 친구는 로그인한 사람이구나!" 하고 기억함.
app.use(session({
  secret: 'moodtrack-secret-key', // 세션 ID를 암호화하기 위한 비밀 키
  resave: false,                  // 세션이 수정되지 않으면 서버에 저장하지 않음
  saveUninitialized: false,       // 초기 빈 세션을 저장하지 않음 (불필요한 세션 방지)

  cookie: {
    httpOnly: true,  // 자바스크립트(document.cookie)에서 쿠키 접근 못하게 함 → XSS 방지
    secure: false,   // HTTPS에서만 쿠키 전송? dev 환경에서는 false
    sameSite: 'lax', // CSRF 방지 + 로컬 개발 시엔 문제 없이 동작하는 모드
    maxAge: 1000 * 60 * 60 * 24 * 7  // 쿠키 유지 기간 (7일)
  }
}));

// JSON 바디 파싱
app.use(express.json())

// 기본 라우트
app.use('/', indexRouter)

// auth 라우트
app.use('/api/auth', authRoutes)

// diary 라우트
app.use('/api/diary', diaryRoutes)

app.set('port', process.env.PORT || 3000)
app.listen(app.get('port'),()=>{
    console.log(`${app.get('port')}번 포트에서 대기중...`)
})
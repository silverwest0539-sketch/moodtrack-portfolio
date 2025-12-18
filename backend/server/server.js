const express = require('express')
const app = express()
const cors = require('cors')

const indexRouter = require('./routes/index')
const authRoutes = require('./routes/authRoutes')

// CORS 설정 (프론트 : 5173 )
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

// JSON 바디 파싱
app.use(express.json())

// 기본 라우트
app.use('/', indexRouter)

// auth 라우트
app.use('/api/auth', authRoutes)


app.set('port', process.env.PORT || 3000)
app.listen(app.get('port'),()=>{
    console.log(`${app.get('port')}번 포트에서 대기중...`)
})
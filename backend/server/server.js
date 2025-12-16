const express = require('express')
const app = express()
const cors = require('cors')

const indexRouter = require('./routes/index')

app.use(cors())
app.use(express.json())
app.use('/', indexRouter)


app.set('port', process.env.PORT || 3000)
app.listen(app.get('port'),()=>{
    console.log(`${app.get('port')}번 포트에서 대기중...`)
})
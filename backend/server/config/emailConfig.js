const nodemailer = require('nodemailer')

// Gmail SMTP 설정
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'silverwest0539@gmail.com',
        pass: 'jkad imxi fxbk uwou'
    }
})

module.exports = transporter;
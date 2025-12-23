// config/kakaoConfig.js
module.exports = {
  AUTH_URL: 'https://kauth.kakao.com/oauth/authorize',
  TOKEN_URL: 'https://kauth.kakao.com/oauth/token',
  USER_URL: 'https://kapi.kakao.com/v2/user/me',

  CLIENT_ID: process.env.KAKAO_REST_KEY,
  REDIRECT_URI: process.env.KAKAO_REDIRECT_URI,
};
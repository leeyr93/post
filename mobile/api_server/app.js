const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const db = require('../../web/config/db'); // 기존 web 폴더의 DB 설정 재사용

const app = express();
const PORT = process.env.PORT || 50006; // 모바일 API 전용 포트

// CORS (세션 쿠키 허용)
app.use(cors({
  origin: true, // 필요 시 특정 도메인으로 변경 (ex: 'http://localhost:3000')
  credentials: true,
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session 설정 (MySQL Store 활용)
const sessionStore = new MySQLStore({}, db.pool);
app.use(session({
  secret: process.env.SESSION_SECRET || 'mobile_secret_key',
  resave: false,
  saveUninitialized: false, // 로그인 완료 시에만 세션 생성
  store: sessionStore,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1일
    httpOnly: true,
  }
}));

// 로그인 체크 미들웨어 (이후 authRouter 내부 등에 활용 가능하나, 여기서는 전역보다는 각 라우터에서 개별 체크)

// Routers 연결
const authRouter = require('./routes/auth');
const boardRouter = require('./routes/board');
const commentRouter = require('./routes/comment');

app.use('/api/auth', authRouter);
app.use('/api/board', boardRouter);
app.use('/api/comment', commentRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Mobile API Server Error:', err);
  res.status(500).json({ success: false, message: '서버 내부 오류가 발생했습니다.' });
});

// Start Server
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`📱 Mobile API Server is running on port ${PORT}`);
  });
}

module.exports = app;

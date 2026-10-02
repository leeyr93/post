const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt-nodejs');
const db = require('../../../web/config/db'); // 기존 web 폴더 DB 재사용

// [POST] /api/auth/join : 회원가입 처리
router.post('/join', async (req, res) => {
  const { id = '', password = '', name = '', email = '' } = req.body;
  
  if (!id || !password || !name || !email) {
    return res.status(400).json({ success: false, message: '모든 필드를 입력해주세요.' });
  }

  try {
    const hash = bcrypt.hashSync(password);
    await db.query('INSERT INTO member (id, password, name, email) VALUES (?, ?, ?, ?)', [
      id, hash, name, email
    ]);
    res.status(201).json({ success: true, message: '회원가입이 완료되었습니다.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: '이미 사용중인 아이디입니다.' });
    }
    console.error('Member Register Error:', err.code || err.message);
    res.status(500).json({ success: false, message: `서버 내부 오류가 발생했습니다: ${err.message}` });
  }
});

// [POST] /api/auth/login : 로그인 처리 (세션 발급)
router.post('/login', async (req, res) => {
  const { id = '', password = '' } = req.body;

  if (!id || !password) {
    return res.status(400).json({ success: false, message: '아이디와 비밀번호를 입력해주세요.' });
  }

  try {
    const rows = await db.query('SELECT * FROM member WHERE id = ?', [id]);

    if (!rows || rows.length === 0) {
      return res.status(401).json({ success: false, message: '존재하지 않는 사용자입니다.' });
    }

    const isMatch = bcrypt.compareSync(password, rows[0].password);
    if (isMatch) {
      if (req.session) {
        req.session.userId = id;
      }
      return res.status(200).json({ success: true, message: '로그인 성공', data: { id: rows[0].id, name: rows[0].name } });
    }

    return res.status(401).json({ success: false, message: '비밀번호가 일치하지 않습니다.' });
  } catch (err) {
    console.error('Member Login Error:', err.code || err.message);
    res.status(500).json({ success: false, message: `서버 내부 오류가 발생했습니다: ${err.message}` });
  }
});

// [POST] /api/auth/logout : 로그아웃 처리
router.post('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout Error:', err);
        return res.status(500).json({ success: false, message: '로그아웃 실패' });
      }
      res.clearCookie('connect.sid'); 
      return res.status(200).json({ success: true, message: '로그아웃 되었습니다.' });
    });
  } else {
    return res.status(200).json({ success: true, message: '이미 로그아웃 상태입니다.' });
  }
});

// [POST] /api/auth/find_id : 아이디 찾기 처리
router.post('/find_id', async (req, res) => {
  const { name = '', email = '' } = req.body;

  if (!name || !email) {
    return res.status(400).json({ success: false, message: '이름과 이메일을 입력해주세요.' });
  }

  try {
    const rows = await db.query('SELECT id FROM member WHERE name = ? AND email = ?', [name, email]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: '일치하는 사용자 정보를 찾을 수 없습니다.' });
    }

    res.status(200).json({ success: true, data: { id: rows[0].id } });
  } catch (err) {
    console.error('Find ID Error:', err.code || err.message);
    res.status(500).json({ success: false, message: `서버 내부 오류가 발생했습니다: ${err.message}` });
  }
});

// [POST] /api/auth/find_pw : 비밀번호 찾기 (회원 검증)
router.post('/find_pw', async (req, res) => {
  const { id = '', name = '', email = '' } = req.body;

  if (!id || !name || !email) {
    return res.status(400).json({ success: false, message: '아이디, 이름, 이메일을 모두 입력해주세요.' });
  }

  try {
    const rows = await db.query(
      'SELECT * FROM member WHERE id = ? AND name = ? AND email = ?',
      [id, name, email]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: '일치하는 사용자 정보를 찾을 수 없습니다.' });
    }

    res.status(200).json({ success: true, message: '회원 정보가 확인되었습니다.' });
  } catch (err) {
    console.error('Find PW Error:', err.code || err.message);
    res.status(500).json({ success: false, message: `서버 내부 오류가 발생했습니다: ${err.message}` });
  }
});

// [POST] /api/auth/re_pw : 비밀번호 재설정 처리
router.post('/re_pw', async (req, res) => {
  const { id = '', password = '' } = req.body;

  if (!id || !password) {
    return res.status(400).json({ success: false, message: '새로운 비밀번호를 입력해주세요.' });
  }

  try {
    const hash = bcrypt.hashSync(password);
    await db.query('UPDATE member SET password = ? WHERE id = ?', [hash, id]);
    res.status(200).json({ success: true, message: '비밀번호가 성공적으로 변경되었습니다.' });
  } catch (err) {
    console.error('Reset PW Error:', err.code || err.message);
    res.status(500).json({ success: false, message: `서버 내부 오류가 발생했습니다: ${err.message}` });
  }
});

module.exports = router;

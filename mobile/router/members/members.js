const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt-nodejs');
const db = require('../../config/db');

// 1. 회원가입
router.post('/', async (req, res) => {
  const { id = '', password = '', name = '', email = '' } = req.body;

  try {
    const hash = bcrypt.hashSync(password);
    await db.query('INSERT INTO member (id, password, name, email) VALUES (?, ?, ?, ?)', [
      id,
      hash,
      name,
      email
    ]);

    console.log('200');
    return res.json({ code: '200' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      console.log('003');
      return res.json({ code: '003' });
    }
    console.error('Member Register Error:', err.code || err.message);
    return res.json({ code: '500' });
  }
});

// 2. 로그인
router.post('/login', async (req, res) => {
  const { id = '', password = '' } = req.body;

  try {
    const rows = await db.query('SELECT * FROM member WHERE id = ?', [id]);

    if (!rows || rows.length === 0) {
      console.log('001');
      return res.json({ code: '001' });
    }

    const isMatch = bcrypt.compareSync(password, rows[0].password);
    if (isMatch) {
      if (req.session) {
        req.session.userId = id;
      }
      console.log('200');
      return res.json({ code: '200' });
    }

    console.log('002');
    return res.json({ code: '002' });
  } catch (err) {
    console.error('Member Login Error:', err.code || err.message);
    return res.json({ code: '500' });
  }
});

// 3. 로그아웃
router.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout Error:', err.code || err.message);
        return res.json({ code: '500' });
      }
      console.log('200');
      return res.json({ code: '200' });
    });
  } else {
    return res.json({ code: '200' });
  }
});

// 4. 아이디 찾기
router.get('/id', async (req, res) => {
  const name = req.query.name || req.body.name;
  const email = req.query.email || req.body.email;

  try {
    const rows = await db.query('SELECT id FROM member WHERE name = ? AND email = ?', [
      name,
      email
    ]);

    if (!rows || rows.length === 0) {
      console.log('004');
      return res.json({ code: '004' });
    }

    console.log('200');
    return res.json({ id: rows[0].id, code: '200' });
  } catch (err) {
    console.error('Find ID Error:', err.code || err.message);
    return res.json({ code: '500' });
  }
});

// 5. 비밀번호 찾기 (회원 정보 검증)
router.get('/pw', async (req, res) => {
  const id = req.query.id || req.body.id;
  const name = req.query.name || req.body.name;
  const email = req.query.email || req.body.email;

  try {
    const rows = await db.query(
      'SELECT * FROM member WHERE id = ? AND name = ? AND email = ?',
      [id, name, email]
    );

    if (!rows || rows.length === 0) {
      console.log('005');
      return res.json({ code: '005' });
    }

    console.log('200');
    return res.json({ code: '200' });
  } catch (err) {
    console.error('Find PW Error:', err.code || err.message);
    return res.json({ code: '500' });
  }
});

// 6. 비밀번호 재설정
router.put('/pw', async (req, res) => {
  const { id = '', password = '' } = req.body;

  try {
    const hash = bcrypt.hashSync(password);
    await db.query('UPDATE member SET password = ? WHERE id = ?', [hash, id]);

    console.log('200');
    return res.json({ code: '200' });
  } catch (err) {
    console.error('Reset PW Error:', err.code || err.message);
    return res.json({ code: '500' });
  }
});

module.exports = router;

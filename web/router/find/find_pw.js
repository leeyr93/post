const express = require('express');
const router = express.Router();
const db = require('../../config/db');

router.get('/', (req, res) => {
  res.render('find/find_pw.ejs', { message: ' ' });
});

router.post('/', async (req, res) => {
  const { id = '', name = '', email = '' } = req.body;

  try {
    const rows = await db.query(
      'SELECT * FROM member WHERE id = ? AND name = ? AND email = ?',
      [id, name, email]
    );

    if (rows && rows.length !== 0) {
      return res.render('find/re_pw.ejs', { rows, message: ' ' });
    }
    // 일치하는 정보 없음 (404 Not Found)
    return res.status(404).render('find/find_pw.ejs', { message: '일치하는 정보가 없습니다.' });
  } catch (err) {
    console.error('Find PW Error:', err.message);
    return res.status(500).send('Something broke!');
  }
});

module.exports = router;


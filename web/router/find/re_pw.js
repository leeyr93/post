const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt-nodejs');
const db = require('../../config/db');

router.get('/', (req, res) => {
  const rows = req.query.id ? [{ id: req.query.id }] : [];
  res.render('find/re_pw.ejs', { message: ' ', rows });
});

router.post('/', async (req, res) => {
  const { id = '', password = '', repassword = '' } = req.body;

  try {
    if (password === repassword) {
      const hash = bcrypt.hashSync(password);
      await db.query('UPDATE member SET password = ? WHERE id = ?', [hash, id]);
      return res.redirect('/login');
    }

    const rows = await db.query('SELECT * FROM member WHERE id = ?', [id]);
    // 비밀번호 불일치 (400 Bad Request)
    return res.status(400).render('find/re_pw.ejs', {
      message: '비밀번호가 일치하지 않습니다.',
      rows
    });
  } catch (err) {
    console.error('Reset PW Error:', err.message);
    return res.status(500).send('Something broke!');
  }
});

module.exports = router;


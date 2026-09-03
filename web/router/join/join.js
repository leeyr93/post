const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt-nodejs');
const db = require('../../config/db');

const ID_REGEX = /^[A-Za-z0-9]{1,10}$/;
const PW_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}[\]|;:'",.<>/?]).{8,16}$/;
const NAME_REGEX = /^[A-Za-z가-힣]{1,10}$/;
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

router.get('/', (req, res) => {
  res.render('join/join.ejs', { message: ' ' });
});

router.post('/', async (req, res, next) => {
  const { id = '', password = '', repassword = '', name = '', email = '' } = req.body;

  if (!id) {
    return res.status(400).render('join/join.ejs', { message: '아이디를 입력해주세요.' });
  }
  if (!password) {
    return res.status(400).render('join/join.ejs', { message: '비밀번호를 입력해주세요.' });
  }
  if (!repassword) {
    return res.status(400).render('join/join.ejs', { message: '비밀번호를 재입력해주세요.' });
  }
  if (password !== repassword) {
    console.log('비밀번호 일치X');
    return res.status(400).render('join/join.ejs', { message: '비밀번호가 일치하지 않습니다.' });
  }
  if (!name) {
    console.log('이름 입력');
    return res.status(400).render('join/join.ejs', { message: '이름을 입력해주세요.' });
  }
  if (!email) {
    console.log('이메일 입력');
    return res.status(400).render('join/join.ejs', { message: '이메일을 입력해주세요.' });
  }

  // 아이디 유효성 (400 Bad Request)
  if (!ID_REGEX.test(id)) {
    console.log('아이디 오류');
    return res.status(400).render('join/join.ejs', {
      message: "아이디는 '특수문자를 제외한 문자 조합. 1-10자' 형식에 맞게 입력해주세요."
    });
  }

  // 비밀번호 유효성 (400 Bad Request)
  if (!PW_REGEX.test(password)) {
    console.log('비밀번호 오류');
    return res.status(400).render('join/join.ejs', {
      message: "비밀번호는 '영문, 숫자, 특수문자 조합. 8-16자' 형식에 맞게 입력해주세요."
    });
  }

  // 이름 유효성 (400 Bad Request)
  if (!NAME_REGEX.test(name)) {
    console.log('이름 오류');
    return res.status(400).render('join/join.ejs', {
      message: "이름은 '숫자, 특수문자를 제외한 문자 조합. 1-10자' 형식에 맞게 입력해주세요."
    });
  }

  // 이메일 유효성 (400 Bad Request)
  if (!EMAIL_REGEX.test(email)) {
    console.log('이메일 오류');
    return res.status(400).render('join/join.ejs', {
      message: "이메일은 '예) example@gmail.com' 형식에 맞게 입력해주세요."
    });
  }

  try {
    const existingUsers = await db.query('SELECT * FROM member WHERE id = ?', [id]);
    if (existingUsers.length > 0) {
      console.log('existed member');
      // 아이디 중복 (409 Conflict)
      return res.status(409).render('join/join.ejs', { message: '사용중인 아이디입니다.' });
    }

    const hash = bcrypt.hashSync(password);
    await db.query('INSERT INTO member (id, password, name, email) VALUES (?, ?, ?, ?)', [
      id,
      hash,
      name,
      email
    ]);

    return res.redirect('/login');
  } catch (err) {
    console.error('Join Error:', err.message);
    return res.status(500).send('Something broke!');
  }
});

module.exports = router;


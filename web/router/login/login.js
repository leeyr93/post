const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt-nodejs');
const db = require('../../config/db');

// Passport session serialization
passport.serializeUser((user, done) => {
  console.log('passport session save :', user.id);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  console.log('passport session get id');
  done(null, id);
});

// Local login strategy
passport.use(
  'local-login',
  new LocalStrategy(
    {
      usernameField: 'id',
      passwordField: 'password',
      passReqToCallback: true
    },
    async (req, id, password, done) => {
      try {
        const rows = await db.query('SELECT * FROM member WHERE id = ?', [id]);
        if (!rows || rows.length === 0) {
          return done(null, false, { message: '존재하지 않는 사용자입니다.' });
        }

        bcrypt.compare(password, rows[0].password, (err, isMatch) => {
          if (err) return done(err);
          if (isMatch) {
            return done(null, { id });
          }
          return done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
        });
      } catch (err) {
        return done(err);
      }
    }
  )
);

router.get('/', (req, res) => {
  const errMsg = req.flash('error');
  let msg = '';
  if (errMsg && errMsg.length > 0) {
    msg = errMsg[0];
  }

  res.render('login/login.ejs', { message: msg });
});

router.post(
  '/',
  (req, res, next) => {
    const id = req.body.id;
    const password = req.body.password;
    if (!id && !password) {
      req.flash('error', '아이디, 비밀번호를 입력해주세요.');
      return res.redirect('/login');
    } else if (!id) {
      req.flash('error', '아이디를 입력해주세요.');
      return res.redirect('/login');
    } else if (!password) {
      req.flash('error', '비밀번호를 입력해주세요.');
      return res.redirect('/login');
    }
    next();
  },
  passport.authenticate('local-login', {
    successRedirect: '/board_list',
    failureRedirect: '/login',
    failureFlash: true
  })
);

module.exports = router;

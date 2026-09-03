const express = require('express');
const router = express.Router();

const join = require('./join/join');
const login = require('./login/login');
const logout = require('./logout/logout');
const boardList = require('./boards/board_list');
const boardView = require('./boards/board_view');
const boardWrite = require('./boards/board_write');
const boardUpdate = require('./boards/board_update');
const boardDelete = require('./boards/board_delete');
const boardSearch = require('./boards/board_search');
const commUpdate = require('./comments/comm_update');
const commDelete = require('./comments/comm_delete');
const findId = require('./find/find_id');
const findPw = require('./find/find_pw');
const rePw = require('./find/re_pw');
const main = require('./main/main');

router.use('/join', join);
router.use('/login', login);
router.use('/logout', logout);
router.use('/board_list', boardList);
router.use('/board_view', boardView);
router.use('/board_write', boardWrite);
router.use('/board_update', boardUpdate);
router.use('/board_delete', boardDelete);
router.use('/board_search', boardSearch);
router.use('/comm_update', commUpdate);
router.use('/comm_delete', commDelete);
router.use('/find_id', findId);
router.use('/find_pw', findPw);
router.use('/re_pw', rePw);
router.use('/main', main);

// Default root redirect
router.get('/', (req, res) => {
  res.redirect('/board_list');
});

module.exports = router;

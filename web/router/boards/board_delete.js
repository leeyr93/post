const express = require('express');
const router = express.Router();
const db = require('../../config/db');

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.redirect('/login');
}

async function deleteBoard(req, res) {
  const postId = typeof req.user === 'object' && req.user !== null ? req.user.id : req.user;
  if (!postId) {
    return res.redirect('/login');
  }

  const postNum = req.body.post_num || req.params.post_num;

  try {
    const result = await db.query('DELETE FROM board WHERE post_num = ? AND post_id = ?', [
      postNum,
      postId
    ]);

    if (!result || result.affectedRows === 0) {
      return res
        .status(403)
        .send(
          '<script>alert("본인이 작성한 글만 삭제할 수 있습니다."); location.href="/board_list";</script>'
        );
    }

    return res.redirect('/board_list');
  } catch (err) {
    console.error('Board Delete Error:', err.message);
    return res.status(500).send('Something broke!');
  }
}

// POST 방식 (REST API 및 폼)
router.post('/', isLoggedIn, deleteBoard);
router.post('/:post_num', isLoggedIn, deleteBoard);

// GET 방식 (웹 a 태그 호환)
router.get('/:post_num', isLoggedIn, deleteBoard);

module.exports = router;

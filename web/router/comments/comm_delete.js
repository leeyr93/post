const express = require('express');
const router = express.Router();
const db = require('../../config/db');

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.redirect('/login');
}

async function deleteComment(req, res) {
  const commId = typeof req.user === 'object' && req.user !== null ? req.user.id : req.user;
  if (!commId) {
    return res.redirect('/login');
  }

  const postNum = req.body.post_num || req.params.post_num;
  const commNum = req.body.comm_num || req.params.comm_num;

  try {
    const result = await db.query('DELETE FROM comment WHERE comm_num = ? AND comm_id = ?', [
      commNum,
      commId
    ]);

    if (!result || result.affectedRows === 0) {
      return res
        .status(403)
        .send(
          `<script>alert("본인이 작성한 댓글만 삭제할 수 있습니다."); location.href="/board_view/${postNum}";</script>`
        );
    }

    return res.redirect(`/board_view/${postNum}`);
  } catch (err) {
    console.error('Comment Delete Error:', err.message);
    return res.status(500).send('Something broke!');
  }
}

// POST 방식 (RESTful API 및 폼)
router.post('/', isLoggedIn, deleteComment);
router.post('/:post_num/:comm_num', isLoggedIn, deleteComment);

// GET 방식 (웹 a 태그 호환)
router.get('/:post_num/:comm_num', isLoggedIn, deleteComment);

module.exports = router;

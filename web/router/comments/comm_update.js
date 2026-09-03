const express = require('express');
const router = express.Router();
const db = require('../../config/db');

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.redirect('/login');
}

router.get('/:post_num/:comm_num', isLoggedIn, async (req, res) => {
  const { post_num: postNum, comm_num: commNum } = req.params;
  const currentUserId = typeof req.user === 'object' && req.user !== null ? req.user.id : req.user;

  try {
    const rows = await db.query('SELECT * FROM comment WHERE comm_num = ?', [commNum]);

    if (!rows || rows.length === 0) {
      return res.redirect(`/board_view/${postNum}`);
    }

    if (rows[0].comm_id !== currentUserId) {
      return res
        .status(403)
        .send(
          `<script>alert("본인이 작성한 댓글만 수정할 수 있습니다."); location.href="/board_view/${postNum}";</script>`
        );
    }

    return res.render('comments/comm_update.ejs', { rows, userId: currentUserId });
  } catch (err) {
    console.error('Comment Update GET Error:', err.message);
    return res.status(500).send('Something broke!');
  }
});

router.post('/', isLoggedIn, async (req, res) => {
  const commId = typeof req.user === 'object' && req.user !== null ? req.user.id : req.user;
  if (!commId) {
    return res.redirect('/login');
  }

  const { post_num: postNum, comm_num: commNum, comm_content: commContent = '' } = req.body;

  try {
    const result = await db.query(
      'UPDATE comment SET comm_content = ? WHERE comm_num = ? AND comm_id = ?',
      [commContent, commNum, commId]
    );

    if (!result || result.affectedRows === 0) {
      return res
        .status(403)
        .send(
          `<script>alert("본인이 작성한 댓글만 수정할 수 있습니다."); location.href="/board_view/${postNum}";</script>`
        );
    }

    return res.redirect(`/board_view/${postNum}`);
  } catch (err) {
    console.error('Comment Update POST Error:', err.message);
    return res.status(500).send('Something broke!');
  }
});

module.exports = router;

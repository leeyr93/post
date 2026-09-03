const express = require('express');
const router = express.Router();
const db = require('../../config/db');

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.redirect('/login');
}

router.get('/:post_num', isLoggedIn, async (req, res) => {
  const postNum = req.params.post_num;
  const currentUserId = typeof req.user === 'object' && req.user !== null ? req.user.id : req.user;

  try {
    const rows = await db.query('SELECT * FROM board WHERE post_num = ?', [postNum]);

    if (!rows || rows.length === 0) {
      return res.redirect('/board_list');
    }

    if (rows[0].post_id !== currentUserId) {
      return res
        .status(403)
        .send(
          `<script>alert("본인이 작성한 글만 수정할 수 있습니다."); location.href="/board_view/${postNum}";</script>`
        );
    }

    return res.render('boards/board_update.ejs', { rows, userId: currentUserId });
  } catch (err) {
    console.error('Board Update GET Error:', err.message);
    return res.status(500).send('Something broke!');
  }
});

router.post('/', isLoggedIn, async (req, res) => {
  const postId = typeof req.user === 'object' && req.user !== null ? req.user.id : req.user;
  if (!postId) {
    return res.redirect('/login');
  }

  const {
    post_num: postNum,
    post_title: postTitle = '',
    post_content: postContent = '',
    originalFileName,
    savedFileName,
    fileSize,
    filePath
  } = req.body;

  try {
    let result;
    if (savedFileName) {
      const sql = `
        UPDATE board 
        SET post_title = ?, post_content = ?, originalFileName = ?, savedFileName = ?, fileSize = ?, filePath = ? 
        WHERE post_num = ? AND post_id = ?
      `;
      result = await db.query(sql, [
        postTitle,
        postContent,
        originalFileName,
        savedFileName,
        fileSize,
        filePath,
        postNum,
        postId
      ]);
    } else {
      const sql = 'UPDATE board SET post_title = ?, post_content = ? WHERE post_num = ? AND post_id = ?';
      result = await db.query(sql, [postTitle, postContent, postNum, postId]);
    }

    if (!result || result.affectedRows === 0) {
      return res
        .status(403)
        .send(
          `<script>alert("본인이 작성한 글만 수정할 수 있습니다."); location.href="/board_view/${postNum}";</script>`
        );
    }

    return res.redirect(`/board_view/${postNum}`);
  } catch (err) {
    console.error('Board Update POST Error:', err.message);
    return res.status(500).send('Something broke!');
  }
});

module.exports = router;

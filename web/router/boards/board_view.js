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
  const userId = typeof req.user === 'object' && req.user !== null ? req.user.id : req.user;

  try {
    // 조회수 증가
    await db.query('UPDATE board SET post_hit = post_hit + 1 WHERE post_num = ?', [postNum]);

    // 댓글이 포함된 상세 조회
    const joinSql = `
      SELECT 
        post_num, post_id, post_title, post_content, 
        DATE_FORMAT(post_time, "%Y/%c/%e") AS post_time, 
        post_hit,
        comm_num, comm_id, comm_content, 
        DATE_FORMAT(comm_time, "%Y/%c/%e") AS comm_time, 
        (SELECT COUNT(comm_num) FROM comment WHERE post_num = ?) AS comm_count
      FROM board 
      JOIN comment USING(post_num) 
      WHERE post_num = ?
    `;

    const rows = await db.query(joinSql, [postNum, postNum]);

    if (rows && rows.length > 0) {
      return res.render('boards/board_view.ejs', { rows, userId });
    }

    // 댓글이 없는 경우 단독 게시글 조회
    const postSql = `
      SELECT 
        post_num, post_id, post_title, post_content, 
        DATE_FORMAT(post_time, "%Y/%c/%e") AS post_time, 
        post_hit,
        0 AS comm_count
      FROM board 
      WHERE post_num = ?
    `;

    const postRows = await db.query(postSql, [postNum]);
    if (!postRows || postRows.length === 0) {
      return res.redirect('/board_list');
    }

    return res.render('boards/board_view.ejs', { rows: postRows, userId });
  } catch (err) {
    console.error('Board View Error:', err.message);
    return res.status(500).send('Something broke!');
  }
});

// 댓글 작성 (POST /board_view)
router.post('/', isLoggedIn, async (req, res) => {
  const commId = typeof req.user === 'object' && req.user !== null ? req.user.id : req.user;
  const { post_num: postNum, comm_content: commContent = '' } = req.body;

  if (!commId) {
    return res.redirect('/login');
  }

  try {
    const insertSql = 'INSERT INTO comment (comm_id, post_num, comm_content) VALUES (?, ?, ?)';
    await db.query(insertSql, [commId, postNum, commContent]);
    return res.redirect(`/board_view/${postNum}`);
  } catch (err) {
    console.error('Create Comment Error:', err.message);
    return res.status(500).send('Something broke!');
  }
});

module.exports = router;

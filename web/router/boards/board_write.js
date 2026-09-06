const express = require('express');
const router = express.Router();
const db = require('../../config/db');

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.redirect('/login');
}

router.get('/', isLoggedIn, (req, res) => {
  const userId = typeof req.user === 'object' && req.user !== null ? req.user.id : req.user;
  res.render('boards/board_write.ejs', { userId });
});

router.post('/', isLoggedIn, async (req, res) => {
  const postId = typeof req.user === 'object' && req.user !== null ? req.user.id : req.user;
  if (!postId) {
    return res.redirect('/login');
  }

  const { post_title: postTitle = '', post_content: postContent = '' } = req.body;

  try {
    const sql = 'INSERT INTO board (post_id, post_title, post_content) VALUES (?, ?, ?)';
    await db.query(sql, [postId, postTitle, postContent]);

    return res.redirect('/board_list');
  } catch (err) {
    console.error('Board Write Error:', err.message);
    return res.status(500).send('Something broke!');
  }
});

module.exports = router;

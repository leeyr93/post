const express = require('express');
const router = express.Router();
const db = require('../../config/db');

router.get('/', async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const boardSearch = req.query.boardSearch || '';

  const limit = 20;
  const offset = (page - 1) * limit;

  let where = '';
  const countParams = [];
  const listParams = [];

  if (boardSearch) {
    where = 'WHERE post_title LIKE ?';
    countParams.push(`%${boardSearch}%`);
    listParams.push(`%${boardSearch}%`);
  }

  listParams.push(limit, offset);

  const listSql = `
    SELECT 
      post_num, post_id, post_title, post_content,
      DATE_FORMAT(post_time, "%Y/%c/%e") AS post_time,
      post_hit,
      (SELECT COUNT(*) FROM comment c WHERE b.post_num = c.post_num) AS comm_count
    FROM board b
    ${where}
    ORDER BY post_num DESC
    LIMIT ? OFFSET ?
  `;

  const countSql = `SELECT COUNT(*) AS total FROM board b ${where}`;

  try {
    const countResult = await db.query(countSql, countParams);
    const total = (countResult && countResult[0] && countResult[0].total) || 0;
    const totalPages = Math.ceil(total / limit) || 1;

    const rows = await db.query(listSql, listParams);

    const userId = typeof req.user === 'object' && req.user !== null ? req.user.id : req.user;

    res.render('boards/board_list.ejs', {
      rows: rows || [],
      userId,
      currentPage: page,
      totalPages,
      boardSearch
    });
  } catch (err) {
    console.error('Board List Error:', err.message);
    res.status(500).send('Something broke!');
  }
});

module.exports = router;

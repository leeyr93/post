const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// 1. 게시글 목록
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT 
        post_num, post_id, post_title, post_content, 
        DATE_FORMAT(post_time, "%Y/%c/%e") AS post_time, 
        post_hit,
        (SELECT COUNT(comm_num) FROM comment c WHERE b.post_num = c.post_num) AS comm_count 
      FROM board b
      ORDER BY post_num DESC
    `;

    const result = await db.query(sql);
    const resultSql = (result || []).map((row) => ({
      post_num: row.post_num,
      post_id: row.post_id,
      post_title: row.post_title,
      post_time: row.post_time,
      post_hit: row.post_hit,
      comm_count: row.comm_count
    }));

    console.log('200');
    return res.json(resultSql);
  } catch (err) {
    console.error('Posts List Error:', err.code || err.message);
    return res.json({ code: '500' });
  }
});

// 2.1 게시글 상세
router.get('/details', async (req, res) => {
  const postNum = req.query.post_num;

  try {
    // 조회수 증가
    await db.query('UPDATE board SET post_hit = post_hit + 1 WHERE post_num = ?', [postNum]);

    const sql = `
      SELECT 
        post_id, post_title, post_content, 
        DATE_FORMAT(post_time, "%Y/%c/%e") AS post_time, 
        post_hit
      FROM board 
      WHERE post_num = ?
    `;

    const result = await db.query(sql, [postNum]);
    const resultSql = (result || []).map((row) => ({
      post_id: row.post_id,
      post_title: row.post_title,
      post_content: row.post_content,
      post_time: row.post_time,
      post_hit: row.post_hit
    }));

    console.log('200');
    return res.json(resultSql);
  } catch (err) {
    console.error('Posts Details Error:', err.code || err.message);
    return res.json({ code: '500' });
  }
});

// 2.2 댓글 상세
router.get('/comments', async (req, res) => {
  const postNum = req.query.post_num;

  try {
    const sql = `
      SELECT 
        comm_num, 
        (SELECT COUNT(comm_num) FROM comment WHERE post_num = ?) AS comm_count, 
        comm_id, comm_content, 
        DATE_FORMAT(comm_time, "%Y/%c/%e") AS comm_time 
      FROM comment 
      WHERE post_num = ?
    `;

    const result = await db.query(sql, [postNum, postNum]);
    const resultSql = (result || []).map((row) => ({
      comm_num: row.comm_num,
      comm_count: row.comm_count,
      comm_id: row.comm_id,
      comm_content: row.comm_content,
      comm_time: row.comm_time
    }));

    console.log('200');
    return res.json(resultSql);
  } catch (err) {
    console.error('Comments List Error:', err.code || err.message);
    return res.json({ code: '500' });
  }
});

// 3. 글쓰기
router.post('/', async (req, res) => {
  const {
    post_id: postId = '',
    post_title: postTitle = '',
    post_content: postContent = '',
    post_time: postTime
  } = req.body;

  try {
    if (postTime) {
      const sql = 'INSERT INTO board (post_id, post_title, post_content, post_time) VALUES (?, ?, ?, ?)';
      await db.query(sql, [postId, postTitle, postContent, postTime]);
    } else {
      const sql = 'INSERT INTO board (post_id, post_title, post_content) VALUES (?, ?, ?)';
      await db.query(sql, [postId, postTitle, postContent]);
    }

    console.log('200');
    return res.json({ code: '200' });
  } catch (err) {
    console.error('Create Post Error:', err.code || err.message);
    return res.json({ code: '500' });
  }
});

// 4. 댓글쓰기
router.post('/comments', async (req, res) => {
  const {
    post_num: postNum,
    comm_id: commId = '',
    comm_content: commContent = '',
    comm_time: commTime
  } = req.body;

  try {
    if (commTime) {
      const sql = 'INSERT INTO comment (post_num, comm_id, comm_content, comm_time) VALUES (?, ?, ?, ?)';
      await db.query(sql, [postNum, commId, commContent, commTime]);
    } else {
      const sql = 'INSERT INTO comment (post_num, comm_id, comm_content) VALUES (?, ?, ?)';
      await db.query(sql, [postNum, commId, commContent]);
    }

    console.log('200');
    return res.json({ code: '200' });
  } catch (err) {
    console.error('Create Comment Error:', err.code || err.message);
    return res.json({ code: '500' });
  }
});

// 5. 글수정
router.put('/', async (req, res) => {
  const { post_num: postNum, post_title: postTitle = '', post_content: postContent = '' } = req.body;

  try {
    const sql = 'UPDATE board SET post_title = ?, post_content = ? WHERE post_num = ?';
    await db.query(sql, [postTitle, postContent, postNum]);

    console.log('200');
    return res.json({ code: '200' });
  } catch (err) {
    console.error('Update Post Error:', err.code || err.message);
    return res.json({ code: '500' });
  }
});

// 6. 댓글수정
router.put('/comments', async (req, res) => {
  const {
    post_num: postNum,
    comm_num: commNum,
    comm_content: commContent = ''
  } = req.body;

  try {
    const sql = 'UPDATE comment SET comm_content = ? WHERE post_num = ? AND comm_num = ?';
    await db.query(sql, [commContent, postNum, commNum]);

    console.log('200');
    return res.json({ code: '200' });
  } catch (err) {
    console.error('Update Comment Error:', err.code || err.message);
    return res.json({ code: '500' });
  }
});

// 7. 글삭제
router.delete('/', async (req, res) => {
  const { post_num: postNum } = req.body;

  try {
    const sql = 'DELETE FROM board WHERE post_num = ?';
    await db.query(sql, [postNum]);

    console.log('200');
    return res.json({ code: '200' });
  } catch (err) {
    console.error('Delete Post Error:', err.code || err.message);
    return res.json({ code: '500' });
  }
});

// 8. 댓글삭제
router.delete('/comments', async (req, res) => {
  const { comm_num: commNum } = req.body;

  try {
    const sql = 'DELETE FROM comment WHERE comm_num = ?';
    await db.query(sql, [commNum]);

    console.log('200');
    return res.json({ code: '200' });
  } catch (err) {
    console.error('Delete Comment Error:', err.code || err.message);
    return res.json({ code: '500' });
  }
});

module.exports = router;

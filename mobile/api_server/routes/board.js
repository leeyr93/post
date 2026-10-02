const express = require('express');
const router = express.Router();
const db = require('../../../web/config/db');

// 미들웨어: 로그인 여부 확인
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ success: false, message: '로그인이 필요합니다.' });
};

// [GET] /api/board/list : 게시글 목록 페이징 조회
router.get('/list', async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  try {
    const countResult = await db.query('SELECT COUNT(*) AS total FROM board');
    const total = (countResult && countResult[0] && countResult[0].total) || 0;
    const totalPages = Math.ceil(total / limit) || 1;

    const sql = `
      SELECT 
        post_num, post_id, post_title, post_content, 
        DATE_FORMAT(post_time, "%Y/%c/%e") AS post_time, 
        post_hit,
        (SELECT COUNT(comm_num) FROM comment c WHERE b.post_num = c.post_num) AS comm_count 
      FROM board b
      ORDER BY post_num DESC
      LIMIT ? OFFSET ?
    `;

    const rows = await db.query(sql, [limit, offset]);
    
    res.status(200).json({
      success: true,
      data: rows || [],
      pagination: {
        currentPage: page,
        totalPages
      }
    });
  } catch (err) {
    console.error('Board List Error:', err);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// [GET] /api/board/search : 제목 검색
router.get('/search', async (req, res) => {
  const keyword = req.query.keyword || '';
  const page = parseInt(req.query.page, 10) || 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  if (!keyword) {
    return res.status(400).json({ success: false, message: '검색어를 입력해주세요.' });
  }

  try {
    const searchPattern = `%${keyword}%`;
    const countResult = await db.query('SELECT COUNT(*) AS total FROM board WHERE post_title LIKE ?', [searchPattern]);
    const total = (countResult && countResult[0] && countResult[0].total) || 0;
    const totalPages = Math.ceil(total / limit) || 1;

    const sql = `
      SELECT 
        post_num, post_id, post_title, post_content, 
        DATE_FORMAT(post_time, "%Y/%c/%e") AS post_time, 
        post_hit,
        (SELECT COUNT(comm_num) FROM comment c WHERE b.post_num = c.post_num) AS comm_count 
      FROM board b
      WHERE post_title LIKE ?
      ORDER BY post_num DESC
      LIMIT ? OFFSET ?
    `;

    const rows = await db.query(sql, [searchPattern, limit, offset]);
    
    res.status(200).json({
      success: true,
      data: rows || [],
      pagination: {
        currentPage: page,
        totalPages
      }
    });
  } catch (err) {
    console.error('Board Search Error:', err);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// [GET] /api/board/view/:post_num : 게시글 상세 조회
router.get('/view/:post_num', async (req, res) => {
  const { post_num } = req.params;

  try {
    // 조회수 1 증가
    await db.query('UPDATE board SET post_hit = post_hit + 1 WHERE post_num = ?', [post_num]);

    const sql = `
      SELECT 
        post_num, post_id, post_title, post_content, 
        DATE_FORMAT(post_time, "%Y/%c/%e") AS post_time, 
        post_hit
      FROM board 
      WHERE post_num = ?
    `;

    const result = await db.query(sql, [post_num]);
    if (!result || result.length === 0) {
      return res.status(404).json({ success: false, message: '게시글을 찾을 수 없습니다.' });
    }

    res.status(200).json({ success: true, data: result[0] });
  } catch (err) {
    console.error('Board View Error:', err);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// [POST] /api/board/write : 게시글 작성 처리
router.post('/write', isAuthenticated, async (req, res) => {
  const { post_title = '', post_content = '' } = req.body;
  const post_id = req.session.userId;
  
  if (!post_title || !post_content) {
    return res.status(400).json({ success: false, message: '제목과 내용을 입력해주세요.' });
  }

  try {
    const sql = 'INSERT INTO board (post_id, post_title, post_content) VALUES (?, ?, ?)';
    await db.query(sql, [post_id, post_title, post_content]);
    res.status(201).json({ success: true, message: '게시글이 성공적으로 등록되었습니다.' });
  } catch (err) {
    console.error('Board Write Error:', err);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// [PUT] /api/board/update/:post_num : 게시글 수정 처리
router.put('/update/:post_num', isAuthenticated, async (req, res) => {
  const { post_num } = req.params;
  const { post_title = '', post_content = '' } = req.body;
  const post_id = req.session.userId;

  if (!post_title || !post_content) {
    return res.status(400).json({ success: false, message: '제목과 내용을 입력해주세요.' });
  }

  try {
    // 본인 작성 글인지 확인
    const checkSql = 'SELECT post_id FROM board WHERE post_num = ?';
    const checkResult = await db.query(checkSql, [post_num]);
    
    if (!checkResult || checkResult.length === 0) {
      return res.status(404).json({ success: false, message: '게시글을 찾을 수 없습니다.' });
    }
    
    if (checkResult[0].post_id !== post_id) {
      return res.status(403).json({ success: false, message: '본인이 작성한 글만 수정할 수 있습니다.' });
    }

    // 수정 처리
    const updateSql = 'UPDATE board SET post_title = ?, post_content = ? WHERE post_num = ?';
    await db.query(updateSql, [post_title, post_content, post_num]);
    
    res.status(200).json({ success: true, message: '게시글이 수정되었습니다.' });
  } catch (err) {
    console.error('Board Update Error:', err);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// [DELETE] /api/board/delete/:post_num : 게시글 삭제 처리
router.delete('/delete/:post_num', isAuthenticated, async (req, res) => {
  const { post_num } = req.params;
  const post_id = req.session.userId;

  try {
    // 본인 작성 글인지 확인
    const checkSql = 'SELECT post_id FROM board WHERE post_num = ?';
    const checkResult = await db.query(checkSql, [post_num]);
    
    if (!checkResult || checkResult.length === 0) {
      return res.status(404).json({ success: false, message: '게시글을 찾을 수 없습니다.' });
    }
    
    if (checkResult[0].post_id !== post_id) {
      return res.status(403).json({ success: false, message: '본인이 작성한 글만 삭제할 수 있습니다.' });
    }

    // 삭제 처리
    const deleteSql = 'DELETE FROM board WHERE post_num = ?';
    await db.query(deleteSql, [post_num]);
    
    res.status(200).json({ success: true, message: '게시글이 삭제되었습니다.' });
  } catch (err) {
    console.error('Board Delete Error:', err);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;

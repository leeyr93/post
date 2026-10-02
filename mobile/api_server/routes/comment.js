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

// [GET] /api/comment/list/:post_num : 특정 게시글의 댓글 목록 조회 (API 명세에는 없지만 앱 구현에 필수)
router.get('/list/:post_num', async (req, res) => {
  const { post_num } = req.params;

  try {
    const sql = `
      SELECT 
        comm_num, comm_id, comm_content, 
        DATE_FORMAT(comm_time, "%Y/%c/%e") AS comm_time 
      FROM comment 
      WHERE post_num = ?
      ORDER BY comm_num ASC
    `;
    const rows = await db.query(sql, [post_num]);
    res.status(200).json({ success: true, data: rows || [] });
  } catch (err) {
    console.error('Comment List Error:', err);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// [POST] /api/comment/write : 댓글 작성 처리
router.post('/write', isAuthenticated, async (req, res) => {
  const { post_num = '', comm_content = '' } = req.body;
  const comm_id = req.session.userId;
  
  if (!post_num || !comm_content) {
    return res.status(400).json({ success: false, message: '게시글 번호와 내용을 입력해주세요.' });
  }

  try {
    const sql = 'INSERT INTO comment (post_num, comm_id, comm_content) VALUES (?, ?, ?)';
    await db.query(sql, [post_num, comm_id, comm_content]);
    
    res.status(201).json({ success: true, message: '댓글이 등록되었습니다.' });
  } catch (err) {
    console.error('Comment Write Error:', err);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// [PUT] /api/comment/update/:post_num/:comm_num : 댓글 수정 처리
router.put('/update/:post_num/:comm_num', isAuthenticated, async (req, res) => {
  const { post_num, comm_num } = req.params;
  const { comm_content = '' } = req.body;
  const comm_id = req.session.userId;

  if (!comm_content) {
    return res.status(400).json({ success: false, message: '댓글 내용을 입력해주세요.' });
  }

  try {
    // 본인 작성 댓글인지 확인
    const checkSql = 'SELECT comm_id FROM comment WHERE comm_num = ? AND post_num = ?';
    const checkResult = await db.query(checkSql, [comm_num, post_num]);
    
    if (!checkResult || checkResult.length === 0) {
      return res.status(404).json({ success: false, message: '댓글을 찾을 수 없습니다.' });
    }
    
    if (checkResult[0].comm_id !== comm_id) {
      return res.status(403).json({ success: false, message: '본인이 작성한 댓글만 수정할 수 있습니다.' });
    }

    // 수정 처리
    const updateSql = 'UPDATE comment SET comm_content = ? WHERE comm_num = ?';
    await db.query(updateSql, [comm_content, comm_num]);
    
    res.status(200).json({ success: true, message: '댓글이 성공적으로 수정되었습니다.' });
  } catch (err) {
    console.error('Comment Update Error:', err);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// [DELETE] /api/comment/delete/:post_num/:comm_num : 댓글 삭제 처리
router.delete('/delete/:post_num/:comm_num', isAuthenticated, async (req, res) => {
  const { post_num, comm_num } = req.params;
  const comm_id = req.session.userId;

  try {
    // 본인 작성 댓글인지 확인
    const checkSql = 'SELECT comm_id FROM comment WHERE comm_num = ? AND post_num = ?';
    const checkResult = await db.query(checkSql, [comm_num, post_num]);
    
    if (!checkResult || checkResult.length === 0) {
      return res.status(404).json({ success: false, message: '댓글을 찾을 수 없습니다.' });
    }
    
    if (checkResult[0].comm_id !== comm_id) {
      return res.status(403).json({ success: false, message: '본인이 작성한 댓글만 삭제할 수 있습니다.' });
    }

    // 삭제 처리
    const deleteSql = 'DELETE FROM comment WHERE comm_num = ?';
    await db.query(deleteSql, [comm_num]);
    
    res.status(200).json({ success: true, message: '댓글이 삭제되었습니다.' });
  } catch (err) {
    console.error('Comment Delete Error:', err);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;

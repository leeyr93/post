const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const userId = typeof req.user === 'object' && req.user !== null ? req.user.id : req.user;
  res.render('main/main.ejs', { userId });
});

module.exports = router;

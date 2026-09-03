const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
  if (typeof req.logout === 'function') {
    if (req.logout.length > 0) {
      req.logout((err) => {
        if (err) return next(err);
        res.redirect('/board_list');
      });
    } else {
      req.logout();
      res.redirect('/board_list');
    }
  } else {
    res.redirect('/board_list');
  }
});

module.exports = router;

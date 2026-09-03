const express = require('express');
const router = express.Router();

const members = require('./members/members');
const posts = require('./posts/posts');

router.use('/members', members);
router.use('/posts', posts);

module.exports = router;

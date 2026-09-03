const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

router.get('/:filename', (req, res) => {
  // Prevent directory traversal attacks using path.basename
  const safeFilename = path.basename(req.params.filename);
  const file = path.resolve(__dirname, '../../uploads', safeFilename);

  if (!fs.existsSync(file)) {
    return res.status(404).send('File not found');
  }

  res.download(file, safeFilename, (err) => {
    if (err) {
      console.error('File Download Error:', err.message);
      if (!res.headersSent) {
        res.status(500).send('Error downloading file');
      }
    }
  });
});

module.exports = router;

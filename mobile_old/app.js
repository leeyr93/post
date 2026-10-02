const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const { pool } = require('./config/db');
const router = require('./router/index');

const app = express();
const PORT = process.env.PORT || 55555;

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session setup
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: true
};

if (process.env.USE_MEMORY_SESSION !== 'true') {
  sessionConfig.store = new MySQLStore({}, pool);
}

app.use(session(sessionConfig));

// Router
app.use(router);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Mobile App Error:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ code: '500', error: err.message });
});

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Mobile Server started on port ${PORT}`);
  });
}

module.exports = app;

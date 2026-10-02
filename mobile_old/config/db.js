let mysql;
try {
  mysql = require('mysql2');
} catch (e) {
  mysql = require('mysql');
}

const path = require('path');
const fs = require('fs');

let config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '111111',
  database: process.env.DB_NAME || 'p',
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10,
  insecureAuth: true
};

// Check for mobile/dbconfig.json or fallback to web/router/dbconfig.json
const possiblePaths = [
  path.join(__dirname, '../dbconfig.json'),
  path.join(__dirname, '../../web/router/dbconfig.json')
];

for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    try {
      const fileConfig = JSON.parse(fs.readFileSync(p, 'utf8'));
      config = {
        ...config,
        ...fileConfig,
        connectionLimit: fileConfig.connectionLimit || config.connectionLimit,
        insecureAuth: true
      };
      break;
    } catch (err) {
      console.error('Error reading dbconfig.json:', err.message);
    }
  }
}

const pool = mysql.createPool(config);

/**
 * Execute a SQL query using connection pool with Promise support.
 * @param {string} sql - SQL query string
 * @param {Array|Object} [params] - Query parameters
 * @returns {Promise<any>} Query results
 */
function query(sql, params) {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
}

module.exports = {
  pool,
  query,
  config
};

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'myskin',
  password: process.env.DB_PASSWORD || 'myskin',
  database: process.env.DB_NAME || 'myskin',
  port: parseInt(process.env.DB_PORT || '3306', 10),
});

module.exports = pool;

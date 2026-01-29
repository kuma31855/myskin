const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'myskin',   
  password: 'myskin',
  database: 'myskin',
  port: 3306,
});

module.exports = pool;

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',         // Ganti jika berbeda
  password: '281202',         // Ganti jika ada password
  database: 'atm'       // Nama DB sesuai perintah
});

module.exports = pool;
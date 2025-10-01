const mysql = require('mysql2/promise');
require('dotenv').config();

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'db_npwp'
});

(async () => {
  try {
    const conn = await db.getConnection();
    console.log("Database connected!");
    conn.release(); // lepas koneksi biar pool bisa dipakai ulang
  } catch (err) {
    console.error("Database connection failed:", err);
  }
})();

module.exports = db;

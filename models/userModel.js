const db = require('../config/db');


const User = {
  findByEmail: (email, callback) => {
    db.query("SELECT * FROM users WHERE email = ?", [email], callback);
  },

  create: (userData, callback) => {
    db.query("INSERT INTO users SET ?", userData, callback);
  },

  findById: async (id) => {
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
    return rows[0];
  },

  updateFaceStatus: async (id, status) => {
    try {
      await db.query("UPDATE users SET status_verifikasi_wajah = ? WHERE id = ?", [status, id]);
    } catch (err) {
      // Jika kolom belum ada di tabel users, abaikan agar verifikasi tetap berjalan
      if (err.code !== 'ER_BAD_FIELD_ERROR') {
        throw err;
      }
    }
  }
};

module.exports = User;

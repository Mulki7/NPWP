const db = require('../config/db');

const LogVerifikasiWajah = {
  create: async ({ user_id, status, foto, skor_kemiripan }) => {
    try {
      const [result] = await db.query(
        'INSERT INTO log_verifikasi_wajah (user_id, status, foto, skor_kemiripan) VALUES (?, ?, ?, ?)',
        [user_id, status, foto || null, skor_kemiripan ?? null]
      );
      return result.insertId;
    } catch (err) {
      // Jika kolom skor_kemiripan belum ada di tabel, fallback ke insert tanpa kolom tersebut
      if (err.code === 'ER_BAD_FIELD_ERROR') {
        const [result] = await db.query(
          'INSERT INTO log_verifikasi_wajah (user_id, status, foto) VALUES (?, ?, ?)',
          [user_id, status, foto || null]
        );
        return result.insertId;
      }
      throw err;
    }
  },
};

module.exports = LogVerifikasiWajah;



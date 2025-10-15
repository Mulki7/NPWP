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
  }
};

module.exports = User;

const db = require('../config/db');

const Pernyataan = {
    getByUserId: async (user_id) => {
        const [rows] = await db.query('SELECT * FROM pernyataan WHERE user_id = ?', [user_id]);
        return rows[0];
    },

    create: async (data) => {
        const [result] = await db.query('INSERT INTO pernyataan SET ?', data);
        return result.insertId;
    },

};

module.exports = Pernyataan;

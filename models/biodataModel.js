const db = require('../config/db');

const Biodata = {
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM biodata_npwp');
        return rows;
    },

    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM biodata_npwp WHERE id = ?', [id]);
        return rows[0];
    },

    getByUserId: async (user_id) => {
        const [rows] = await db.query('SELECT * FROM biodata_npwp WHERE user_id = ?', [user_id]);
        return rows[0];
    },

    create: async (data) => {
        const [result] = await db.query('INSERT INTO biodata_npwp SET ?', data);
        return result.insertId;
    },

    update: async (id, data) => {
        const [result] = await db.query('UPDATE biodata_npwp SET ? WHERE id = ?', [data, id]);
        return result.affectedRows;
    },

    patch: async (id, data) => {
        const [result] = await db.query('UPDATE biodata_npwp SET ? WHERE id = ?', [data, id]);
        return result.affectedRows;
    },

    delete: async (id) => {
        const [result] = await db.query('DELETE FROM biodata_npwp WHERE id = ?', [id]);
        return result.affectedRows;
    }
};

module.exports = Biodata;

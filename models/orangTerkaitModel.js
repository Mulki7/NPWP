const db = require('../config/db');

const OrangTerkait = {
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM orang_terkait');
        return rows;
    },

    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM orang_terkait WHERE id = ?', [id]);
        return rows[0];
    },

    getByUserId: async (user_id) => {
        const [rows] = await db.query('SELECT * FROM orang_terkait WHERE user_id = ? ORDER BY created_at DESC', [user_id]);
        return rows;
    },

    getByIdAndUserId: async (id, user_id) => {
        const [rows] = await db.query('SELECT * FROM orang_terkait WHERE id = ? AND user_id = ?', [id, user_id]);
        return rows[0];
    },

    create: async (data) => {
        const [result] = await db.query('INSERT INTO orang_terkait SET ?', data);
        return result.insertId;
    },

    update: async (id, data) => {
        const [result] = await db.query('UPDATE orang_terkait SET ? WHERE id = ?', [data, id]);
        return result.affectedRows;
    },

    patch: async (id, data) => {
        const [result] = await db.query('UPDATE orang_terkait SET ? WHERE id = ?', [data, id]);
        return result.affectedRows;
    },

    delete: async (id) => {
        const [result] = await db.query('DELETE FROM orang_terkait WHERE id = ?', [id]);
        return result.affectedRows;
    },

    existsByNikAndUserId: async (nik_relasi, user_id) => {
        const [rows] = await db.query('SELECT id FROM orang_terkait WHERE nik_relasi = ? AND user_id = ?', [nik_relasi, user_id]);
        return rows.length > 0;
    }
};

module.exports = OrangTerkait;
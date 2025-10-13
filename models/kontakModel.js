const db = require('../config/db');

const Kontak = {
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM kontak');
        return rows;
    },

    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM kontak WHERE id = ?', [id]);
        return rows[0];
    },

    getByUserId: async (user_id) => {
        const [rows] = await db.query('SELECT * FROM kontak WHERE user_id = ? ORDER BY created_at DESC', [user_id]);
        return rows;
    },

    getByIdAndUserId: async (id, user_id) => {
        const [rows] = await db.query('SELECT * FROM kontak WHERE id = ? AND user_id = ?', [id, user_id]);
        return rows[0];
    },

    create: async (data) => {
        const [result] = await db.query('INSERT INTO kontak SET ?', data);
        return result.insertId;
    },

    update: async (id, data) => {
        const [result] = await db.query('UPDATE kontak SET ? WHERE id = ?', [data, id]);
        return result.affectedRows;
    },

    patch: async (id, data) => {
        const [result] = await db.query('UPDATE kontak SET ? WHERE id = ?', [data, id]);
        return result.affectedRows;
    },

    delete: async (id) => {
        const [result] = await db.query('DELETE FROM kontak WHERE id = ?', [id]);
        return result.affectedRows;
    }
};

module.exports = Kontak;
const db = require('../config/db');

const Alamat = {
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM alamat');
        return rows;
    },

    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM alamat WHERE id = ?', [id]);
        return rows[0];
    },

    getByUserId: async (user_id) => {
        const [rows] = await db.query('SELECT * FROM alamat WHERE user_id = ? ORDER BY created_at DESC', [user_id]);
        return rows;
    },

    getByIdAndUserId: async (id, user_id) => {
        const [rows] = await db.query('SELECT * FROM alamat WHERE id = ? AND user_id = ?', [id, user_id]);
        return rows[0];
    },

    create: async (data) => {
        // Convert data_geometris to JSON string if it's an object
        if (data.data_geometris && typeof data.data_geometris === 'object') {
            data.data_geometris = JSON.stringify(data.data_geometris);
        }
        
        const [result] = await db.query('INSERT INTO alamat SET ?', data);
        return result.insertId;
    },

    update: async (id, data) => {
        // Convert data_geometris to JSON string if it's an object
        if (data.data_geometris && typeof data.data_geometris === 'object') {
            data.data_geometris = JSON.stringify(data.data_geometris);
        }
        
        const [result] = await db.query('UPDATE alamat SET ? WHERE id = ?', [data, id]);
        return result.affectedRows;
    },

    patch: async (id, data) => {
        // Convert data_geometris to JSON string if it's an object
        if (data.data_geometris && typeof data.data_geometris === 'object') {
            data.data_geometris = JSON.stringify(data.data_geometris);
        }
        
        const [result] = await db.query('UPDATE alamat SET ? WHERE id = ?', [data, id]);
        return result.affectedRows;
    },

    delete: async (id) => {
        const [result] = await db.query('DELETE FROM alamat WHERE id = ?', [id]);
        return result.affectedRows;
    }
};

module.exports = Alamat;
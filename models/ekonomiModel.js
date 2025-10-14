const db = require('../config/db');

const Ekonomi = {
    // Get ekonomi + penghasilan + detail pekerjaan/usaha milik user
    getByUserId: async (user_id) => {
        // Ambil data ekonomi
        const [ekonomiRows] = await db.query('SELECT * FROM ekonomi WHERE user_id = ?', [user_id]);
        if (ekonomiRows.length === 0) return null;
        const ekonomi = ekonomiRows[0];
        // Ambil semua penghasilan
        const [penghasilanRows] = await db.query('SELECT * FROM penghasilan WHERE ekonomi_id = ?', [ekonomi.id]);
        // Untuk tiap penghasilan, ambil detail pekerjaan/kegiatan_usaha
        for (const p of penghasilanRows) {
            if (p.jenis_penghasilan === 'Pekerjaan' || p.jenis_penghasilan === 'Pekerjaan Bebas') {
                const [pekerjaanRows] = await db.query('SELECT * FROM pekerjaan WHERE penghasilan_id = ?', [p.id]);
                p.detail = pekerjaanRows[0] || null;
            } else if (p.jenis_penghasilan === 'Kegiatan Usaha') {
                const [usahaRows] = await db.query('SELECT * FROM kegiatan_usaha WHERE penghasilan_id = ?', [p.id]);
                p.detail = usahaRows[0] || null;
            } else {
                p.detail = null;
            }
        }
        ekonomi.penghasilan = penghasilanRows;
        return ekonomi;
    },

    // Upsert ekonomi (insert jika belum ada, update jika sudah ada)
    upsert: async (user_id, data) => {
        const [rows] = await db.query('SELECT * FROM ekonomi WHERE user_id = ?', [user_id]);
        if (rows.length === 0) {
            const [result] = await db.query('INSERT INTO ekonomi SET ?', { ...data, user_id });
            return result.insertId;
        } else {
            await db.query('UPDATE ekonomi SET ? WHERE user_id = ?', [data, user_id]);
            return rows[0].id;
        }
    },

    // Tambah penghasilan
    addPenghasilan: async (ekonomi_id, data) => {
        const [result] = await db.query('INSERT INTO penghasilan SET ?', { ...data, ekonomi_id });
        return result.insertId;
    },

    // Update penghasilan
    updatePenghasilan: async (id, data) => {
        const [result] = await db.query('UPDATE penghasilan SET ? WHERE id = ?', [data, id]);
        return result.affectedRows;
    },

    // Hapus penghasilan (beserta detail pekerjaan/usaha)
    deletePenghasilan: async (id) => {
        // Hapus detail pekerjaan/usaha
        await db.query('DELETE FROM pekerjaan WHERE penghasilan_id = ?', [id]);
        await db.query('DELETE FROM kegiatan_usaha WHERE penghasilan_id = ?', [id]);
        // Hapus penghasilan
        const [result] = await db.query('DELETE FROM penghasilan WHERE id = ?', [id]);
        return result.affectedRows;
    },

    // Tambah detail pekerjaan
    addPekerjaan: async (penghasilan_id, data) => {
        const [result] = await db.query('INSERT INTO pekerjaan SET ?', { ...data, penghasilan_id });
        return result.insertId;
    },

    // Update detail pekerjaan
    updatePekerjaan: async (id, data) => {
        const [result] = await db.query('UPDATE pekerjaan SET ? WHERE id = ?', [data, id]);
        return result.affectedRows;
    },

    // Tambah detail kegiatan usaha
    addUsaha: async (penghasilan_id, data) => {
        const [result] = await db.query('INSERT INTO kegiatan_usaha SET ?', { ...data, penghasilan_id });
        return result.insertId;
    },

    // Update detail kegiatan usaha
    updateUsaha: async (id, data) => {
        const [result] = await db.query('UPDATE kegiatan_usaha SET ? WHERE id = ?', [data, id]);
        return result.affectedRows;
    },
};

module.exports = Ekonomi;

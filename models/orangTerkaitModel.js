const db = require('../config/db');

const OrangTerkait = {
    // Query helpers
    query: (sql, params = []) => db.query(sql, params).then(([rows]) => rows),
    queryOne: (sql, params = []) => db.query(sql, params).then(([rows]) => rows[0]),
    queryCount: (sql, params = []) => db.query(sql, params).then(([rows]) => rows.length > 0),
    queryInsert: (sql, params = []) => db.query(sql, params).then(([result]) => result.insertId),
    queryUpdate: (sql, params = []) => db.query(sql, params).then(([result]) => result.affectedRows),

    // CRUD operations
    getAll: () => OrangTerkait.query('SELECT * FROM orang_terkait'),
    getById: (id) => OrangTerkait.queryOne('SELECT * FROM orang_terkait WHERE id = ?', [id]),
    getByUserId: (user_id) => OrangTerkait.query('SELECT * FROM orang_terkait WHERE user_id = ? ORDER BY created_at DESC', [user_id]),
    getByIdAndUserId: (id, user_id) => OrangTerkait.queryOne('SELECT * FROM orang_terkait WHERE id = ? AND user_id = ?', [id, user_id]),
    create: (data) => OrangTerkait.queryInsert('INSERT INTO orang_terkait SET ?', [data]),
    update: (id, data) => OrangTerkait.queryUpdate('UPDATE orang_terkait SET ? WHERE id = ?', [data, id]),
    patch: (id, data) => OrangTerkait.queryUpdate('UPDATE orang_terkait SET ? WHERE id = ?', [data, id]),
    delete: (id) => OrangTerkait.queryUpdate('DELETE FROM orang_terkait WHERE id = ?', [id]),
    existsByNikAndUserId: (nik_relasi, user_id) => OrangTerkait.queryCount('SELECT id FROM orang_terkait WHERE nik_relasi = ? AND user_id = ?', [nik_relasi, user_id])
};

module.exports = OrangTerkait;
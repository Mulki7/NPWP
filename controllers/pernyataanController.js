const Pernyataan = require('../models/pernyataanModel');


// GET pernyataan milik user (JWT)
exports.getByUser = async (req, res) => {
    try {
        const user_id = req.user.id;
        const data = await Pernyataan.getByUserId(user_id);
        if (!data) return res.status(404).json({ message: 'Data tidak ditemukan' });
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengambil data', error: err.message });
    }
};

// POST create pernyataan (hanya butuh field disetujui dari body, tanggal_submit otomatis)
exports.create = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { disetujui } = req.body;
        if (typeof disetujui !== 'boolean') {
            return res.status(400).json({ message: 'Field disetujui harus boolean' });
        }
        const tanggal_submit = new Date();
        const data = { user_id, disetujui, tanggal_submit };
        const insertId = await Pernyataan.create(data);
        res.status(201).json({ message: 'Pernyataan berhasil disubmit', id: insertId });
    } catch (err) {
        res.status(500).json({ message: 'Gagal submit pernyataan', error: err.message });
    }
};

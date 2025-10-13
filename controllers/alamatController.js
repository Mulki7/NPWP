const Alamat = require('../models/alamatModel');

// GET all alamat
exports.getAll = async (req, res) => {
    try {
        const data = await Alamat.getAll();
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengambil data', error: err.message });
    }
};

// GET alamat by id
exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await Alamat.getById(id);
        if (!data) return res.status(404).json({ message: 'Data tidak ditemukan' });
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengambil data', error: err.message });
    }
};

// GET alamat by user_id (from JWT)
exports.getByUserId = async (req, res) => {
    try {
        const user_id = req.user.id;
        const data = await Alamat.getByUserId(user_id);
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengambil data', error: err.message });
    }
};

// POST create alamat
exports.create = async (req, res) => {
    try {
        const user_id = req.user.id;
        const data = { ...req.body, user_id };
        const insertId = await Alamat.create(data);
        res.status(201).json({ message: 'Alamat berhasil dibuat', id: insertId });
    } catch (err) {
        res.status(500).json({ message: 'Gagal membuat alamat', error: err.message });
    }
};

// PUT update alamat by user_id (JWT)
exports.updateByUserId = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { id } = req.body;
        if (!id) return res.status(400).json({ message: 'ID alamat harus diisi' });
        
        const alamat = await Alamat.getByIdAndUserId(id, user_id);
        if (!alamat) return res.status(404).json({ message: 'Data tidak ditemukan' });
        
        const data = req.body;
        const affected = await Alamat.update(id, data);
        res.json({ message: 'Alamat berhasil diupdate' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal update alamat', error: err.message });
    }
};

// PATCH alamat by user_id (JWT)
exports.patchByUserId = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { id } = req.body;
        if (!id) return res.status(400).json({ message: 'ID alamat harus diisi' });
        
        const alamat = await Alamat.getByIdAndUserId(id, user_id);
        if (!alamat) return res.status(404).json({ message: 'Data tidak ditemukan' });
        
        const data = req.body;
        const affected = await Alamat.patch(id, data);
        res.json({ message: 'Alamat berhasil diubah sebagian' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal patch alamat', error: err.message });
    }
};

// DELETE alamat by user_id (JWT)
exports.deleteByUserId = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { id } = req.body;
        if (!id) return res.status(400).json({ message: 'ID alamat harus diisi' });
        
        const alamat = await Alamat.getByIdAndUserId(id, user_id);
        if (!alamat) return res.status(404).json({ message: 'Data tidak ditemukan' });
        
        const affected = await Alamat.delete(id);
        res.json({ message: 'Alamat berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal hapus alamat', error: err.message });
    }
};
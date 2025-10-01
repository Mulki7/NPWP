const Biodata = require('../models/biodataModel');

// GET all biodata
exports.getAll = async (req, res) => {
    try {
        const data = await Biodata.getAll();
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengambil data', error: err.message });
    }
};

// GET biodata by id
exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await Biodata.getById(id);
        if (!data) return res.status(404).json({ message: 'Data tidak ditemukan' });
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengambil data', error: err.message });
    }
};

// GET biodata by user_id (from JWT)
exports.getByUserId = async (req, res) => {
    try {
        const user_id = req.user.id;
        const data = await Biodata.getByUserId(user_id);
        if (!data) return res.status(404).json({ message: 'Data tidak ditemukan' });
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengambil data', error: err.message });
    }
};


// Fungsi generate NPWP otomatis (contoh: 09.XXX.XXX.X-XXX.XXX)
function generateNpwp() {
    // Format: 09.123.456.7-890.000
    const random = () => Math.floor(100 + Math.random() * 900);
    const part1 = random();
    const part2 = random();
    const part3 = Math.floor(Math.random() * 10);
    const part4 = random();
    const part5 = random();
    return `09.${part1}.${part2}.${part3}-${part4}.${part5}`;
}


const axios = require('axios');

// POST create biodata dengan validasi NIK ke API eksternal
exports.create = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { nik } = req.body;
        // Validasi NIK ke API eksternal
        const apiUrl = `https://ktp.chasouluix.biz.id/api/ktp/nik/${nik}`;
        const nikRes = await axios.get(apiUrl);
        if (!nikRes.data || !nikRes.data.data || !nikRes.data.data.nik) {
            return res.status(400).json({ message: 'NIK tidak ditemukan di database KTP eksternal' });
        }
        const npwp = generateNpwp();
        const data = { ...req.body, user_id, npwp };
        const insertId = await Biodata.create(data);
        res.status(201).json({ message: 'Biodata berhasil dibuat', id: insertId, npwp });
    } catch (err) {
        // Jika error dari API eksternal
        if (err.response && err.response.status === 404) {
            return res.status(400).json({ message: 'NIK tidak ditemukan di database KTP eksternal' });
        }
        res.status(500).json({ message: 'Gagal membuat biodata', error: err.message });
    }
};


// PUT update biodata by user_id (JWT)
exports.updateByUserId = async (req, res) => {
    try {
        const user_id = req.user.id;
        const data = req.body;
        const biodata = await Biodata.getByUserId(user_id);
        if (!biodata) return res.status(404).json({ message: 'Data tidak ditemukan' });
        const affected = await Biodata.update(biodata.id, data);
        res.json({ message: 'Biodata berhasil diupdate' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal update biodata', error: err.message });
    }
};

// PATCH biodata by user_id (JWT)
exports.patchByUserId = async (req, res) => {
    try {
        const user_id = req.user.id;
        const data = req.body;
        const biodata = await Biodata.getByUserId(user_id);
        if (!biodata) return res.status(404).json({ message: 'Data tidak ditemukan' });
        const affected = await Biodata.patch(biodata.id, data);
        res.json({ message: 'Biodata berhasil diubah sebagian' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal patch biodata', error: err.message });
    }
};

// DELETE biodata by user_id (JWT)
exports.deleteByUserId = async (req, res) => {
    try {
        const user_id = req.user.id;
        const biodata = await Biodata.getByUserId(user_id);
        if (!biodata) return res.status(404).json({ message: 'Data tidak ditemukan' });
        const affected = await Biodata.delete(biodata.id);
        res.json({ message: 'Biodata berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal hapus biodata', error: err.message });
    }
};

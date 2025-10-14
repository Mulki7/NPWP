const Ekonomi = require('../models/ekonomiModel');

// GET ekonomi + penghasilan + detail milik user
exports.getByUser = async (req, res) => {
    try {
        const user_id = req.user.id;
        const data = await Ekonomi.getByUserId(user_id);
        if (!data) return res.status(404).json({ message: 'Data ekonomi tidak ditemukan' });
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengambil data ekonomi', error: err.message });
    }
};

// POST/PUT ekonomi (upsert)
exports.upsert = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { metode, mata_uang, periode_pembukuan } = req.body;
        const id = await Ekonomi.upsert(user_id, { metode, mata_uang, periode_pembukuan });
        res.json({ message: 'Data ekonomi berhasil disimpan', id });
    } catch (err) {
        res.status(500).json({ message: 'Gagal simpan data ekonomi', error: err.message });
    }
};

// POST tambah penghasilan (beserta detail pekerjaan/usaha)
exports.addPenghasilan = async (req, res) => {
    try {
        const user_id = req.user.id;
        const ekonomi = await Ekonomi.getByUserId(user_id);
        if (!ekonomi) return res.status(404).json({ message: 'Data ekonomi tidak ditemukan' });
        const { jenis_penghasilan, kode_klu, detail } = req.body;
        const penghasilan_id = await Ekonomi.addPenghasilan(ekonomi.id, { jenis_penghasilan, kode_klu });
        // Tambah detail pekerjaan/usaha
        if (jenis_penghasilan === 'Pekerjaan' || jenis_penghasilan === 'Pekerjaan Bebas') {
            await Ekonomi.addPekerjaan(penghasilan_id, detail);
        } else if (jenis_penghasilan === 'Kegiatan Usaha') {
            await Ekonomi.addUsaha(penghasilan_id, detail);
        }
        res.status(201).json({ message: 'Penghasilan berhasil ditambah', penghasilan_id });
    } catch (err) {
        res.status(500).json({ message: 'Gagal tambah penghasilan', error: err.message });
    }
};

// PUT update penghasilan
exports.updatePenghasilan = async (req, res) => {
    try {
        const { id, jenis_penghasilan, kode_klu, detail } = req.body;
        await Ekonomi.updatePenghasilan(id, { jenis_penghasilan, kode_klu });
        // Update detail pekerjaan/usaha
        if (jenis_penghasilan === 'Pekerjaan' || jenis_penghasilan === 'Pekerjaan Bebas') {
            await Ekonomi.updatePekerjaan(detail.id, detail);
        } else if (jenis_penghasilan === 'Kegiatan Usaha') {
            await Ekonomi.updateUsaha(detail.id, detail);
        }
        res.json({ message: 'Penghasilan berhasil diupdate' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal update penghasilan', error: err.message });
    }
};

// DELETE penghasilan
exports.deletePenghasilan = async (req, res) => {
    try {
        const { id } = req.params;
        await Ekonomi.deletePenghasilan(id);
        res.json({ message: 'Penghasilan berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal hapus penghasilan', error: err.message });
    }
};

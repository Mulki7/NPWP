const Biodata = require('../models/biodataModel');

// PATCH status biodata (admin only)

const User = require('../models/userModel');
const generateNpwpCardPdf = require('../utils/generateNpwpCardPdf');
const transporter = require('../config/email');

exports.updateStatusById = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!['verified', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Status hanya boleh verified atau rejected' });
        }
        const biodata = await Biodata.getById(id);
        if (!biodata) {
            return res.status(404).json({ message: 'Data tidak ditemukan' });
        }
        await Biodata.update(id, { status });

        // Jika status diverifikasi, generate PDF dan kirim email
        if (status === 'verified') {
            const user = await User.findById(biodata.user_id);
            if (!user) {
                return res.status(404).json({ message: 'User tidak ditemukan' });
            }

            // Generate PDF kartu NPWP (pakai util terpisah)
            try {
                const pdfData = await generateNpwpCardPdf(biodata, user);
                await transporter.sendMail({
                    from: 'NPWP App <no-reply@npwp.com>',
                    to: user.email,
                    subject: 'Kartu NPWP Digital',
                    text: 'Berikut adalah kartu NPWP digital Anda.',
                    attachments: [
                        {
                            filename: 'kartu-npwp.pdf',
                            content: pdfData
                        }
                    ]
                });
                return res.json({ message: `Status biodata berhasil diubah menjadi ${status}, kartu NPWP telah dikirim ke email user.` });
            } catch (emailErr) {
                return res.status(500).json({ message: 'Status berhasil diubah, tapi gagal mengirim email kartu NPWP', error: emailErr.message });
            }
        }

        // Jika bukan verified, langsung response
        res.json({ message: `Status biodata berhasil diubah menjadi ${status}` });
    } catch (err) {
        return res.status(500).json({ message: 'Gagal update status biodata', error: err.message });
    }
}

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

// GET biodata - Admin bisa lihat semua, User hanya milik sendiri
exports.getByUserId = async (req, res) => {
    try {
        // Jika admin, return semua data
        if (req.user.role === 'admin') {
            const allData = await Biodata.getAll();
            return res.json(allData);
        }
        
        // Jika user, return hanya data milik sendiri
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

// DELETE biodata by id (admin only)
exports.deleteById = async (req, res) => {
    try {
        const { id } = req.params;
        const biodata = await Biodata.getById(id);
        if (!biodata) return res.status(404).json({ message: 'Data tidak ditemukan' });
        const affected = await Biodata.delete(id);
        res.json({ message: 'Biodata berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal hapus biodata', error: err.message });
    }
};
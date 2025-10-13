const Kontak = require('../models/kontakModel');

// Helper function untuk validasi email
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Helper function untuk validasi nomor HP
const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10,15}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
};

// GET all kontak
exports.getAll = async (req, res) => {
    try {
        const data = await Kontak.getAll();
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengambil data', error: err.message });
    }
};

// GET kontak by id
exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await Kontak.getById(id);
        if (!data) return res.status(404).json({ message: 'Data tidak ditemukan' });
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengambil data', error: err.message });
    }
};

// GET kontak by user_id (from JWT)
exports.getByUserId = async (req, res) => {
    try {
        const user_id = req.user.id;
        const data = await Kontak.getByUserId(user_id);
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengambil data', error: err.message });
    }
};

// POST create kontak
exports.create = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { email, no_hp } = req.body;

        // Validasi field wajib
        if (!email || !no_hp) {
            return res.status(400).json({ 
                message: 'Email dan nomor HP harus diisi' 
            });
        }

        // Validasi format email
        if (!validateEmail(email)) {
            return res.status(400).json({ 
                message: 'Format email tidak valid' 
            });
        }

        // Validasi format nomor HP
        if (!validatePhone(no_hp)) {
            return res.status(400).json({ 
                message: 'Format nomor HP tidak valid (minimal 10 digit)' 
            });
        }

        const data = { 
            user_id, 
            email, 
            no_hp,
            status_verifikasi: 'pending',
            waktu_kirim: new Date()
        };
        
        const insertId = await Kontak.create(data);
        res.status(201).json({ 
            message: 'Kontak berhasil dibuat', 
            id: insertId 
        });
    } catch (err) {
        res.status(500).json({ 
            message: 'Gagal membuat kontak', 
            error: err.message 
        });
    }
};
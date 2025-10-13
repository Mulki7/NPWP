const Kontak = require('../models/kontakModel');
const transporter = require('../config/email');

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone) => /^[0-9]{10,15}$/.test(phone.replace(/\D/g, ''));
const getData = (req) => Array.isArray(req.body) && req.body.length > 0 ? req.body[0] : req.body;
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendEmail = async (email, message, code = null) => {
    await transporter.sendMail({
        from: 'mulkiaziz0703@gmail.com',
        to: email,
        subject: 'Konfirmasi Kontak - NPWP System',
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Konfirmasi Kontak Anda</h2>
            <p>Terima kasih telah mendaftar di sistem NPWP kami.</p>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
                <h3 style="color: #28a745; margin: 0;">✅ ${message}</h3>
                ${code ? `<div style="background-color: #fff; padding: 15px; margin: 15px 0; border-radius: 5px; border: 2px solid #28a745;">
                    <p style="margin: 0; font-size: 14px; color: #666;">Kode Verifikasi:</p>
                    <h2 style="margin: 5px 0; color: #28a745; letter-spacing: 3px;">${code}</h2>
                </div>` : ''}
            </div>
            <p>Email Anda telah berhasil diverifikasi dan dapat digunakan untuk komunikasi resmi.</p>
            <p>Jika Anda tidak meminta konfirmasi ini, silakan hubungi administrator.</p>
            <hr style="margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">Email ini dikirim secara otomatis, jangan balas email ini.</p>
        </div>`
    });
};

exports.getAll = async (req, res) => {
    try {
        res.json({ message: 'Data kontak berhasil diambil', data: await Kontak.getAll() });
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengambil data kontak', error: err.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const data = await Kontak.getById(req.params.id);
        if (!data) return res.status(404).json({ message: 'Data kontak tidak ditemukan' });
        res.json({ message: 'Data kontak berhasil diambil', data });
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengambil data kontak', error: err.message });
    }
};

exports.getByUserId = async (req, res) => {
    try {
        res.json({ message: 'Data kontak berhasil diambil', data: await Kontak.getByUserId(req.user.id) });
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengambil data kontak', error: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { email, no_hp } = getData(req);
        const user_id = req.user.id;

        if (!email || !no_hp) return res.status(400).json({ message: 'Email dan nomor HP harus diisi' });
        if (!validateEmail(email)) return res.status(400).json({ message: 'Format email tidak valid' });
        if (!validatePhone(no_hp)) return res.status(400).json({ message: 'Format nomor HP tidak valid (minimal 10 digit)' });

        const verificationCode = generateCode();
        const insertId = await Kontak.create({ 
            user_id, 
            email, 
            no_hp, 
            status_verifikasi: 'pending', 
            waktu_kirim: new Date()
        });
        
        try {
            await sendEmail(email, 'Kontak Anda telah berhasil dibuat', verificationCode);
        } catch (emailError) {
            console.error('Gagal mengirim email:', emailError);
        }
        
        res.status(201).json({ 
            message: 'Kontak berhasil dibuat dan email verifikasi dikirim.',
            id: insertId,
            data: { user_id, email, no_hp, status_verifikasi: 'pending' }
        });
    } catch (err) {
        res.status(500).json({ message: 'Gagal membuat kontak', error: err.message });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { id, verification_code } = getData(req);
        const user_id = req.user.id;

        if (!id) return res.status(400).json({ message: 'ID kontak harus diisi' });
        if (!verification_code) return res.status(400).json({ message: 'Kode verifikasi harus diisi' });

        const kontak = await Kontak.getByIdAndUserId(id, user_id);
        if (!kontak) return res.status(404).json({ message: 'Data kontak tidak ditemukan' });
        if (kontak.status_verifikasi === 'verified') return res.status(400).json({ message: 'Kontak sudah terverifikasi sebelumnya' });

        // Simulasi validasi kode (bisa diganti dengan logika lain)
        if (verification_code.length !== 6 || !/^\d+$/.test(verification_code)) {
            return res.status(400).json({ message: 'Kode verifikasi tidak valid' });
        }

        await Kontak.update(id, { status_verifikasi: 'verified', waktu_verif: new Date() });

        try {
            await sendEmail(kontak.email, 'Kontak Anda telah berhasil diverifikasi');
        } catch (emailError) {
            console.error('Gagal mengirim email:', emailError);
        }

        res.json({ message: 'Email berhasil diverifikasi', status_verifikasi: 'verified' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal verifikasi email', error: err.message });
    }
};

exports.resendEmailCode = async (req, res) => {
    try {
        const { id } = getData(req);
        const user_id = req.user.id;

        if (!id) return res.status(400).json({ message: 'ID kontak harus diisi' });

        const kontak = await Kontak.getByIdAndUserId(id, user_id);
        if (!kontak) return res.status(404).json({ message: 'Data kontak tidak ditemukan' });

        const newCode = generateCode();
        await Kontak.update(id, { 
            waktu_kirim: new Date()
        });

        try {
            await sendEmail(kontak.email, 'Konfirmasi ulang kontak Anda', newCode);
        } catch (emailError) {
            console.error('Gagal mengirim email:', emailError);
            return res.status(500).json({ message: 'Gagal mengirim email konfirmasi' });
        }

        res.json({ message: 'Email konfirmasi berhasil dikirim ulang' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengirim ulang email konfirmasi', error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { id, email, no_hp } = getData(req);
        const user_id = req.user.id;

        if (!id) return res.status(400).json({ message: 'ID kontak harus diisi' });

        const kontak = await Kontak.getByIdAndUserId(id, user_id);
        if (!kontak) return res.status(404).json({ message: 'Data kontak tidak ditemukan' });

        if (email && !validateEmail(email)) return res.status(400).json({ message: 'Format email tidak valid' });
        if (no_hp && !validatePhone(no_hp)) return res.status(400).json({ message: 'Format nomor HP tidak valid (minimal 10 digit)' });

        const updateData = {};
        if (email) updateData.email = email;
        if (no_hp) updateData.no_hp = no_hp;

        if (Object.keys(updateData).length === 0) return res.status(200).json({ message: 'Tidak ada perubahan yang dilakukan' });

        await Kontak.update(id, updateData);
        res.json({ message: 'Kontak berhasil diupdate', data: await Kontak.getByIdAndUserId(id, user_id) });
    } catch (err) {
        res.status(500).json({ message: 'Gagal update kontak', error: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = getData(req);
        const user_id = req.user.id;

        if (!id) return res.status(400).json({ message: 'ID kontak harus diisi' });

        const kontak = await Kontak.getByIdAndUserId(id, user_id);
        if (!kontak) return res.status(404).json({ message: 'Data kontak tidak ditemukan' });

        await Kontak.delete(id);
        res.json({ message: 'Kontak berhasil dihapus', deletedId: id });
    } catch (err) {
        res.status(500).json({ message: 'Gagal hapus kontak', error: err.message });
    }
};
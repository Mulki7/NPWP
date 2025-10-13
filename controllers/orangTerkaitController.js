const OrangTerkait = require('../models/orangTerkaitModel');
const axios = require('axios');

// Helper functions
const validateNik = (nik) => /^[0-9]{16}$/.test(nik);
const extractNama = (data) => data?.nama || data?.nama_lengkap || data?.name || 
    (data?.nama_depan && data?.nama_belakang ? `${data.nama_depan} ${data.nama_belakang}` : null);
const fetchNamaFromApi = async (nik) => {
    const response = await axios.get(`https://ktp.chasouluix.biz.id/api/ktp/nik/${nik}`);
    return response.data?.success ? extractNama(response.data.data) : extractNama(response.data);
};

// Controllers
exports.getAll = async (req, res) => {
    try {
        res.json(await OrangTerkait.getAll());
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengambil data', error: err.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const data = await OrangTerkait.getById(req.params.id);
        res.json(data || res.status(404).json({ message: 'Data tidak ditemukan' }));
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengambil data', error: err.message });
    }
};

exports.getByUserId = async (req, res) => {
    try {
        res.json(await OrangTerkait.getByUserId(req.user.id));
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengambil data', error: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { nik_relasi, hubungan, keterangan } = req.body;
        const user_id = req.user.id;

        // Validasi
        if (!nik_relasi || !hubungan) {
            return res.status(400).json({ message: 'NIK Relasi dan Hubungan wajib diisi' });
        }
        if (!validateNik(nik_relasi)) {
            return res.status(400).json({ message: 'Format NIK tidak valid (harus 16 digit angka)' });
        }
        if (await OrangTerkait.existsByNikAndUserId(nik_relasi, user_id)) {
            return res.status(409).json({ message: 'NIK Relasi ini sudah terdaftar untuk user Anda' });
        }

        // Fetch nama dari API
        let nama_from_api;
        try {
            nama_from_api = await fetchNamaFromApi(nik_relasi);
            if (!nama_from_api) {
                return res.status(404).json({ message: 'NIK tidak terdaftar atau data nama tidak ditemukan dari sumber eksternal' });
            }
        } catch (apiError) {
            const status = apiError.response?.status === 404 ? 404 : 500;
            const message = status === 404 ? 'NIK tidak terdaftar di database KTP eksternal' : 'Gagal mengambil data NIK dari sumber eksternal';
            return res.status(status).json({ message, error: apiError.message });
        }

        // Simpan ke database
        const data = { user_id, nama: nama_from_api, hubungan, nik_relasi, keterangan: keterangan || null };
        const insertId = await OrangTerkait.create(data);
        
        res.status(201).json({ message: 'Orang terkait berhasil dibuat', id: insertId, nama: nama_from_api });
    } catch (err) {
        res.status(500).json({ message: 'Gagal membuat orang terkait', error: err.message });
    }
};

// Debug endpoints
exports.testNikApi = async (req, res) => {
    try {
        const { nik } = req.query;
        if (!nik) return res.status(400).json({ message: 'Parameter NIK harus diisi' });

        const response = await axios.get(`https://ktp.chasouluix.biz.id/api/ktp/nik/${nik}`);
        res.json({
            message: 'API Test berhasil',
            api_url: `https://ktp.chasouluix.biz.id/api/ktp/nik/${nik}`,
            status: response.status,
            data: response.data,
            extracted_nama: extractNama(response.data?.data || response.data)
        });
    } catch (error) {
        res.status(500).json({
            message: 'API Test gagal',
            error: error.message,
            api_url: `https://ktp.chasouluix.biz.id/api/ktp/nik/${req.query.nik}`
        });
    }
};

exports.checkDatabase = async (req, res) => {
    try {
        const db = require('../config/db');
        const [tables] = await db.query("SHOW TABLES LIKE 'orang_terkait'");
        const [columns] = await db.query("DESCRIBE orang_terkait");
        const [data] = await db.query("SELECT * FROM orang_terkait LIMIT 5");
        
        res.json({
            message: 'Database check berhasil',
            table_exists: tables.length > 0,
            table_structure: columns,
            existing_data: data
        });
    } catch (error) {
        res.status(500).json({ message: 'Database check gagal', error: error.message });
    }
};
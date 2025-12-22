require('dotenv').config();
const express = require('express');
const app = express();
const authRoutes = require('./routes/authRoutes');
const cors = require('cors');
const biodataRoutes = require('./routes/biodataRoutes');
const pernyataanRoutes = require('./routes/pernyataanRoutes');
const ekonomiRoutes = require('./routes/ekonomiRoutes');
const alamatRoutes = require('./routes/alamatRoutes');
const kontakRoutes = require('./routes/kontakRoutes');
const orangTerkaitRoutes = require('./routes/orangTerkaitRoutes');
const faceVerificationRoutes = require('./routes/faceVerificationRoutes');

app.use(cors());
app.use(express.json()); // parse JSON

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/biodata', biodataRoutes);
app.use('/api/pernyataan', pernyataanRoutes);
app.use('/api/ekonomi', ekonomiRoutes);
app.use('/api/alamat', alamatRoutes);
app.use('/api/kontak', kontakRoutes);
app.use('/api/orang-terkait', orangTerkaitRoutes);
app.use('/api/face-verification', faceVerificationRoutes);


// Auto-create admin account if not exists
const db = require('./config/db');
const bcrypt = require('bcryptjs');

async function createAdminIfNotExists() {
    const email = 'adminnpwp@gmail.com';
    const password = 'adminnpwp123';
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            const hashedPassword = await bcrypt.hash(password, 10);
            await db.query(
                "INSERT INTO users (email, password, role, status, is_verified) VALUES (?, ?, ?, ?, ?)",
                [email, hashedPassword, 'admin', 'aktif', true]
            );
            console.log('Akun admin berhasil dibuat.');
        } else {
            console.log('Akun admin sudah ada.');
        }
    } catch (err) {
        console.error('Gagal membuat akun admin:', err.message);
    }
}

createAdminIfNotExists();

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

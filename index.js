require('dotenv').config();
const express = require('express');
const app = express();
const authRoutes = require('./routes/authRoutes');
const cors = require('cors');
const biodataRoutes = require('./routes/biodataRoutes');
const pernyataanRoutes = require('./routes/pernyataanRoutes');
const alamatRoutes = require('./routes/alamatRoutes');
const kontakRoutes = require('./routes/kontakRoutes');
const orangTerkaitRoutes = require('./routes/orangTerkaitRoutes');

app.use(cors());
app.use(express.json()); // parse JSON

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/biodata', biodataRoutes);
app.use('/api/pernyataan', pernyataanRoutes);
app.use('/api/alamat', alamatRoutes);
app.use('/api/kontak', kontakRoutes);
app.use('/api/orang-terkait', orangTerkaitRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

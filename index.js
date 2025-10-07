require('dotenv').config();
const express = require('express');
const app = express();
const authRoutes = require('./routes/authRoutes');
const cors = require('cors');
const biodataRoutes = require('./routes/biodataRoutes');
const pernyataanRoutes = require('./routes/pernyataanRoutes');

app.use(cors());
app.use(express.json()); // parse JSON

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/biodata', biodataRoutes);
app.use('/api/pernyataan', pernyataanRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

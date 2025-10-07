const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const pernyataanController = require('../controllers/pernyataanController');

// Semua endpoint pakai JWT
router.use(authMiddleware);


// GET pernyataan milik user
router.get('/', pernyataanController.getByUser);

// POST create pernyataan
router.post('/', pernyataanController.create);

module.exports = router;

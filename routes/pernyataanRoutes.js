const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const pernyataanController = require('../controllers/pernyataanController');

// Semua endpoint pakai JWT
router.use(authMiddleware);

const { adminOnly, adminOrUser } = require('../middleware/roleMiddleware');

// GET pernyataan milik user
router.get('/', adminOrUser, pernyataanController.getByUser);

// POST create pernyataan
router.post('/', adminOrUser, pernyataanController.create);

module.exports = router;

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const kontakController = require('../controllers/kontakController');

// Semua endpoint pakai JWT
router.use(authMiddleware);

// Routes
router.get('/', kontakController.getByUserId);
router.post('/', kontakController.create);

module.exports = router;
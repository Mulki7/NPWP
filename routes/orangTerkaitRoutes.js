const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const orangTerkaitController = require('../controllers/orangTerkaitController');

// Semua endpoint pakai JWT
router.use(authMiddleware);

// Routes
router.get('/', orangTerkaitController.getByUserId);
router.post('/', orangTerkaitController.create);

// Debug routes (hapus di production)
router.get('/test-api', orangTerkaitController.testNikApi);
router.get('/check-db', orangTerkaitController.checkDatabase);

module.exports = router;
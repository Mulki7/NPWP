const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const orangTerkaitController = require('../controllers/orangTerkaitController');

// Semua endpoint pakai JWT
router.use(authMiddleware);

const { adminOnly, adminOrUser } = require('../middleware/roleMiddleware');

// Routes
router.get('/', adminOrUser, orangTerkaitController.getByUserId);
router.post('/', adminOrUser, orangTerkaitController.create);

// Debug routes (hapus di production)
router.get('/test-api', adminOnly, orangTerkaitController.testNikApi);
router.get('/check-db', adminOnly, orangTerkaitController.checkDatabase);

module.exports = router;
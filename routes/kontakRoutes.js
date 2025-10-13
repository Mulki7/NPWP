const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const kontakController = require('../controllers/kontakController');

// Semua endpoint pakai JWT
router.use(authMiddleware);

// ==================== ROUTES ====================

// GET endpoints
router.get('/', kontakController.getByUserId);

// POST endpoints
router.post('/', kontakController.create);
router.post('/verify-email', kontakController.verifyEmail);
router.post('/resend-email', kontakController.resendEmailCode);

// PUT/PATCH endpoints
router.put('/', kontakController.update);

// DELETE endpoints
router.delete('/', kontakController.delete);

module.exports = router;
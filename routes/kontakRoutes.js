const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const kontakController = require('../controllers/kontakController');

// Semua endpoint pakai JWT
router.use(authMiddleware);

// ==================== ROUTES ====================

const { adminOnly, adminOrUser } = require('../middleware/roleMiddleware');

// GET endpoints
router.get('/', adminOrUser, kontakController.getByUserId);

// POST endpoints
router.post('/', adminOrUser, kontakController.create);
router.post('/verify-email', adminOrUser, kontakController.verifyEmail);
router.post('/resend-email', adminOrUser, kontakController.resendEmailCode);

// PUT/PATCH endpoints
router.put('/', adminOrUser, kontakController.update);

// DELETE endpoints
router.delete('/', adminOnly, kontakController.delete);

module.exports = router;
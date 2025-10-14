const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const alamatController = require('../controllers/alamatController');

// Semua endpoint pakai JWT
router.use(authMiddleware);

const { adminOnly, adminOrUser } = require('../middleware/roleMiddleware');

// Routes
router.get('/', adminOrUser, alamatController.getByUserId);
router.post('/', adminOrUser, alamatController.create);
router.put('/', adminOrUser, alamatController.updateByUserId);
router.patch('/', adminOrUser, alamatController.patchByUserId);
router.delete('/', adminOnly, alamatController.deleteByUserId);

module.exports = router;
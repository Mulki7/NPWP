const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const alamatController = require('../controllers/alamatController');

// Semua endpoint pakai JWT
router.use(authMiddleware);

// Routes
router.get('/', alamatController.getByUserId);
router.post('/', alamatController.create);
router.put('/', alamatController.updateByUserId);
router.patch('/', alamatController.patchByUserId);
router.delete('/', alamatController.deleteByUserId);

module.exports = router;
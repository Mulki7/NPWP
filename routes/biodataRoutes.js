const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const biodataController = require('../controllers/biodataController');

// Semua endpoint pakai JWT
router.use(authMiddleware);


// GET biodata milik user (JWT)
router.get('/me', biodataController.getByUserId);

// POST create biodata milik user (JWT)
router.post('/me', biodataController.create);

// PUT update biodata milik user (JWT)
router.put('/me', biodataController.updateByUserId);

// PATCH biodata milik user (JWT)
router.patch('/me', biodataController.patchByUserId);

// DELETE biodata milik user (JWT)
router.delete('/me', biodataController.deleteByUserId);

module.exports = router;

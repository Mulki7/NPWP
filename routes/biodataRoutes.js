const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const biodataController = require('../controllers/biodataController');

// Semua endpoint pakai JWT
router.use(authMiddleware);


// GET biodata milik user (JWT)
router.get('/', biodataController.getByUserId);

// POST create biodata milik user (JWT)
router.post('/', biodataController.create);

// PUT update biodata milik user (JWT)
router.put('/', biodataController.updateByUserId);

// PATCH biodata milik user (JWT)
router.patch('/', biodataController.patchByUserId);

// DELETE biodata milik user (JWT)
router.delete('/', biodataController.deleteByUserId);

module.exports = router;

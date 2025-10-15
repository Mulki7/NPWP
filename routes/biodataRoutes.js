const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const biodataController = require('../controllers/biodataController');

// Semua endpoint pakai JWT
router.use(authMiddleware);


const { adminOnly, adminOrUser } = require('../middleware/roleMiddleware');

// GET biodata milik user (JWT)
router.get('/', adminOrUser, biodataController.getByUserId);

// POST create biodata milik user (JWT)
router.post('/', adminOrUser, biodataController.create);

// PUT update biodata milik user (JWT)
router.put('/', adminOrUser, biodataController.updateByUserId);

// PATCH biodata milik user (JWT)
router.patch('/', adminOrUser, biodataController.patchByUserId);


router.patch('/:id/status', adminOnly, biodataController.updateStatusById);

// DELETE biodata by id (admin only)
router.delete('/:id', adminOnly, biodataController.deleteById);

module.exports = router;

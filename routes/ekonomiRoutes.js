const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

const { adminOnly, adminOrUser } = require('../middleware/roleMiddleware');

const ekonomiController = require('../controllers/ekonomiController');

router.use(authMiddleware);

// GET ekonomi + penghasilan + detail milik user (admin & user)
router.get('/', adminOrUser, ekonomiController.getByUser);

// POST/PUT ekonomi (admin & user)
router.post('/', adminOrUser, ekonomiController.upsert);

// Tambah penghasilan (admin & user)
router.post('/penghasilan', adminOrUser, ekonomiController.addPenghasilan);

// Update penghasilan (admin & user)
router.put('/penghasilan', adminOrUser, ekonomiController.updatePenghasilan);

// Hapus penghasilan (admin only)
router.delete('/penghasilan/:id', adminOnly, ekonomiController.deletePenghasilan);

module.exports = router;

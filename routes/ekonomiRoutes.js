const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const ekonomiController = require('../controllers/ekonomiController');

router.use(authMiddleware);

// GET ekonomi + penghasilan + detail milik user
router.get('/', ekonomiController.getByUser);

// POST/PUT ekonomi (upsert)
router.post('/', ekonomiController.upsert);

// Tambah penghasilan
router.post('/penghasilan', ekonomiController.addPenghasilan);

// Update penghasilan
router.put('/penghasilan', ekonomiController.updatePenghasilan);

// Hapus penghasilan
router.delete('/penghasilan/:id', ekonomiController.deletePenghasilan);

module.exports = router;

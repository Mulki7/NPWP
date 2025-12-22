const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer(); // memory storage untuk ambil buffer file
const { verifyFace } = require('../controllers/faceVerificationController');

// Endpoint: POST /api/face-verification/verify
// Terima file selfie via form-data key "image" atau gunakan selfie_base64/selfie_url
router.post('/verify', authMiddleware, upload.single('image'), verifyFace);

module.exports = router;


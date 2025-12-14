const express = require("express");
const router = express.Router();
const { register, login, verifyEmail } = require("../controllers/authController");
const { registerLimiter, loginLimiter, verifyLimiter } = require("../middleware/rateLimitMiddleware");

router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);
router.post("/verify", verifyLimiter, verifyEmail);

module.exports = router;

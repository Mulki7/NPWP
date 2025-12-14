const rateLimit = require('express-rate-limit');

// Rate limit untuk register (maksimal 5 request per jam per IP)
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 jam
    max: 5,
    message: 'Terlalu banyak akun dibuat dari IP ini, coba lagi dalam 1 jam',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
});

// Rate limit untuk login (maksimal 10 request per 15 menit per IP)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 10,
    message: 'Terlalu banyak percobaan login, coba lagi dalam 15 menit',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
});

// Rate limit untuk OTP verification (maksimal 5 attempt per 15 menit per IP)
const verifyLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 5,
    message: 'Terlalu banyak percobaan verifikasi, coba lagi dalam 15 menit',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
});

module.exports = {
    registerLimiter,
    loginLimiter,
    verifyLimiter
};

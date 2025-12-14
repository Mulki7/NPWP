const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const transporter = require("../config/email");
const { registerSchema, loginSchema, verifyEmailSchema } = require("../utils/validationSchema");

// REGISTER
exports.register = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate input
    const { error, value } = registerSchema.validate({ email, password });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [value.email]);
    if (rows.length > 0) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    const hashedPassword = await bcrypt.hash(value.password, 10);

    // generate OTP 6 digit
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60000); // 10 menit

    await db.query(
      "INSERT INTO users (email, password, verification_code, code_expires, is_verified) VALUES (?, ?, ?, ?, ?)",
      [value.email, hashedPassword, otp, expires, false]
    );

    // kirim OTP ke email
    await transporter.sendMail({
      from: '"NPWP App" <youremail@gmail.com>',
      to: value.email,
      subject: "Kode Verifikasi NPWP",
      text: `Kode verifikasi Anda adalah: ${otp}. Berlaku 10 menit.`,
    });

    res.json({ message: "Register berhasil, cek email untuk kode verifikasi" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// VERIFIKASI OTP
exports.verifyEmail = async (req, res) => {
  const { email, code } = req.body;

  try {
    // Validate input
    const { error, value } = verifyEmailSchema.validate({ email, code });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [value.email]);
    if (rows.length === 0) return res.status(400).json({ message: "Email tidak ditemukan" });

    const user = rows[0];
    if (user.is_verified) return res.status(400).json({ message: "Email sudah diverifikasi" });

    if (user.verification_code !== value.code) {
      return res.status(400).json({ message: "Kode OTP salah" });
    }

    if (new Date(user.code_expires) < new Date()) {
      return res.status(400).json({ message: "Kode OTP sudah kadaluarsa" });
    }

    await db.query("UPDATE users SET is_verified = ?, verification_code = NULL, code_expires = NULL WHERE id = ?", [true, user.id]);

    res.json({ message: "Email berhasil diverifikasi" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate input
    const { error, value } = loginSchema.validate({ email, password });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [value.email]);
    if (rows.length === 0) return res.status(400).json({ message: "Email tidak ditemukan" });

    const user = rows[0];
    if (!user.is_verified) {
      return res.status(403).json({ message: "Email belum diverifikasi" });
    }

    const validPassword = await bcrypt.compare(value.password, user.password);
    if (!validPassword) return res.status(400).json({ message: "Password salah" });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ message: "Login berhasil", token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

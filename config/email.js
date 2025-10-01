const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",       // Gmail SMTP
  port: 587,                    // STARTTLS
  secure: false,                // true kalau pakai 465 SSL
  auth: {
    user: "mulkiaziz0703@gmail.com", // email Gmail kamu
    pass: "qpmo fjbcoxioualr"     // App Password 16 karakter, tanpa spasi
  },
  tls: {
    rejectUnauthorized: false
  }
});

module.exports = transporter;

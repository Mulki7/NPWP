const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",   // ambil dari Mailtrap
  port: 2525,                         // biasanya 2525
  auth: {
    user: "e886722d2daafa",       // ganti dengan user dari Mailtrap
    pass: "11f0b34bc4892e",       // ganti dengan pass dari Mailtrap
  },
});

module.exports = transporter;

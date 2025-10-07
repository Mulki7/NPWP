const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",       
  port: 587,                    
  secure: false,                
  auth: {
    user: "mulkiaziz0703@gmail.com", 
    pass: "qpmo fjbcoxioualr"     
  },
  tls: {
    rejectUnauthorized: false
  }
});

module.exports = transporter;

const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Generate OTP (6-digit random number)
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // ✅ Bypass self-signed SSL error
  },
});


// Function to send OTP email
async function sendOTP(email, otp) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "AuraChef - Password Reset OTP",
    text: `Your OTP for password reset is: ${otp}. This OTP is valid for 10 minutes.`,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { generateOTP, sendOTP };

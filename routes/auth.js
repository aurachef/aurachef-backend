const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authCheck = require("../middleware/AuthMiddleware"); // ✅ Fixed import
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// ✅ Signup Route
router.post("/signup", async (req, res) => {
  console.log("🔹 Received signup request:", req.body);

  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUserWithEmail = await User.findOne({ email });
    if (existingUserWithEmail) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const existingUserWithUsername = await User.findOne({ username });
    if (existingUserWithUsername) {
      return res.status(400).json({ message: "Username already in use" });
    }

    // ✅ Set first user as admin
    const isFirstUser = (await User.countDocuments()) === 0;
    const isAdmin = isFirstUser; 

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      username,
      email,
      password: hashedPassword,
      isAdmin, // ✅ Now correctly defined
    });

    await newUser.save();
    console.log("✅ User registered:", newUser);

     // ✅ Include isAdmin in JWT payload
     const payload = {
      userId: newUser._id,
      username: newUser.username,
      email: newUser.email,
      isAdmin: newUser.isAdmin, 
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "2h" });

    console.log("✅ Login successful:", { email, isAdmin: newUser.isAdmin });

    res.status(200).json({
      message: "User registered successfully!",
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        isAdmin: newUser.isAdmin, 
      },
    });
  } 

   //res.status(201).json({ message: "User registered successfully!" });
  catch (error) {
    console.error("❌ Signup Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Login Route
router.post("/login", async (req, res) => {
  console.log("🔹 Received login request:", req.body);

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // ✅ Include isAdmin in JWT payload
    const payload = {
      userId: user._id,
      email: user.email,
      username: user.username,
      isAdmin: user.isAdmin, 
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "2h" });

    console.log("✅ Login successful:", { email, isAdmin: user.isAdmin });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin, 
      },
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Verify Token Route
router.post("/verify-token", authCheck, async (req, res) => {
  res.status(200).json({ user: req.user, is_authenticated: req.is_authenticated });
});





const { generateOTP, sendOTP } = require("../utils/sendOtp");

router.post("/request-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Generate OTP and set expiration (10 minutes)
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiration = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes validity

    await user.save();

    // Send OTP via email
    await sendOTP(email, otp);

    res.status(200).json({ message: "OTP sent successfully!" });
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpiration < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // OTP is valid, clear it and generate a password reset token
    user.otp = null;
    user.otpExpiration = null;
    await user.save();

    // Generate a temporary token for password reset
    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "15m" });

    res.status(200).json({ message: "OTP verified!", resetToken });
  } catch (error) {
    console.error("❌ OTP Verification Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


router.post("/reset-password", async (req, res) => {
  const { newPassword, token } = req.body;

  if (!newPassword || !token) {
    return res.status(400).json({ message: "New password and token are required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password reset successfully!" });
  } catch (error) {
    console.error("❌ Password Reset Error:", error);
    res.status(500).json({ message: "Invalid or expired token" });
  }
});


module.exports = router;

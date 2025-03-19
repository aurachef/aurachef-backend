const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

const authCheck = async (req, res, next) => {
  console.log("🔍 Checking AUTH ✅");

  const token = req.header("Authorization");

  if (!token) {
    console.log("⚠️ No token provided");
    req.user = null;
    req.is_authenticated = false;
    return next(); // ✅ Important: Move to the next middleware
  }

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), JWT_SECRET);
    const user = await User.findOne({ email: decoded.email }).select("-password");

    if (!user) {
      console.log("❌ User not found");
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    req.is_authenticated = true;
    console.log("✅ Token verified, user authorized:", user.email);
    next();
  } catch (error) {
    console.log("❌ Invalid token:", error.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authCheck;

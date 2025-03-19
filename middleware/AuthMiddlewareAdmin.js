const jwt = require("jsonwebtoken");
const  JWT_SECRET  = process.env.JWT_SECRET;
const User = require("../models/User"); // Assuming User model is here

const adminAuthCheck = async (req, res, next) => {
  console.log("cheking AUTH of Admin  ✅ ")
  const token = req.header("Authorization");
  if (!token) {
      return res.status(404).json({ message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), JWT_SECRET);

    const user = await User.findOne({ email: decoded.email }).select('-password');
    if (!user) {
      console.log("❌ User not found");
      return res.status(404).json({ message: "User not found" });
    }

    if(!user.isAdmin){
      console.log("❌ User is not admin");
      return res.status(404).json({ message: "User has no privillage" });
    }
    

    req.user = user;
    req.is_authenticated = true;
    console.log("✅ Token verified, admin authorized:", user.email);
    next();
  } catch (error) {
    console.log("❌ Invalid token");
    res.status(400).json({ message: "Invalid token" });
  }
};

module.exports = adminAuthCheck;

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String, default: "" },
  avatar: {
    type: String,
    default:
      "https://static.vecteezy.com/system/resources/thumbnails/005/544/718/small_2x/profile-icon-design-free-vector.jpg",
  },
  isAdmin: { type: Boolean, default: false },
  dailyGoal: { type: Number, default: 0 }, // Store recommended calorie intake
  otp: { type: String }, // Store OTP
  otpExpiration: { type: Date }, // Expiration time (e.g., 5 minutes)
});

module.exports = mongoose.model("User", userSchema);

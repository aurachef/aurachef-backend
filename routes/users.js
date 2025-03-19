const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authCheck = require("../middleware/AuthMiddleware");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");

// Ensure the upload directory exists
const uploadDir = "images/profile";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve static files from the images directory
router.use('/images', express.static('images'));

// Multer storage configuration for profile pictures
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}-${Date.now()}${ext}`);
  },
});

// File type filter
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
    cb(new Error("Invalid file type. Only PNG, JPG and JPEG are allowed."));
  }
};

// Multer middleware
const upload = multer({ 
  storage: fileStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Get user profile
router.get("/profile", authCheck, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Ensure avatar URL is properly formatted
    if (user.avatar) {
      user.avatar = `${user.avatar.replace(/^\//, '')}`;
    }
    
    res.json(user);
  } catch (error) {
    console.error("❌ Error fetching user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update user profile
router.put("/profile", authCheck, async (req, res) => {
  try {
    const { username, bio, avatar } = req.body;
    const updateData = {
      username,
      bio: bio || "",
      avatar: avatar || ""  // Use the avatar URL directly from request body
    };

    // Check if username is already taken (if username is being changed)
    if (username !== req.user.username) {
      const existingUser = await User.findOne({ 
        username,
        _id: { $ne: req.user._id }
      });
      
      if (existingUser) {
        return res.status(400).json({ message: "Username is already taken" });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { 
        new: true,
        runValidators: true,
        select: '-password'
      }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("❌ Error updating user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
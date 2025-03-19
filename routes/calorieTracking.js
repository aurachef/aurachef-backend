const express = require("express");
const router = express.Router();
const FoodLog = require("../models/FoodLog");
const User = require("../models/User");
const authCheck = require("../middleware/AuthMiddleware"); // Ensure authentication

// ✅ Update or Set Daily Calorie Goal
router.put("/calorie-goal", authCheck, async (req, res) => {
  try {
    const { dailyGoal } = req.body;

    // Validate input
    if (!dailyGoal || dailyGoal < 500 || dailyGoal > 10000) {
      return res.status(400).json({ message: "Invalid calorie goal" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { dailyGoal },
      { new: true, select: "-password" }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Daily goal updated!", user: updatedUser });
  } catch (error) {
    console.error("❌ Error updating calorie goal:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Add a new food entry//
router.post("/food-log", authCheck, async (req, res) => {
  try {
    const { food, calories, meal, time } = req.body;

    if (!food || !calories || !meal) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newEntry = new FoodLog({
      userId: req.user._id,
      food,
      calories,
      meal,
      time: time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date()
    });

    await newEntry.save();
    res.status(201).json({ message: "Food entry added!", entry: newEntry });
  } catch (error) {
    console.error("❌ Error adding food entry:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


// ✅ Get today's food log for a user
router.get("/food-log", authCheck, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const logs = await FoodLog.find({
      userId: req.user._id,
      date: { $gte: today }, // Get only today's entries
    }).sort({ date: 1 }); // Sort by date ascending

    res.json({ logs });
  } catch (error) {
    console.error("❌ Error fetching food logs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Delete a specific food entry
router.delete("/food-log/:id", authCheck, async (req, res) => {
  try {
    const { id } = req.params;

    // First check if the entry exists
    const existingEntry = await FoodLog.findById(id);
    if (!existingEntry) {
      return res.status(404).json({ message: "Food entry not found" });
    }

    // Check if the entry belongs to the user
    if (existingEntry.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this entry" });
    }

    // Delete the entry
    await existingEntry.deleteOne();
    res.json({ message: "Food entry deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting food entry:", error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: "Invalid entry ID format" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});


// Reset all food logs and clear daily goals
router.delete("/food-log-reset", authCheck, async (req, res) => {
  try {
    const userId = req.user.id; // Make sure you're using the correct property (id vs _id)
    
    // Delete all food logs for this user
    await FoodLog.deleteMany({ userId });
    
    // Reset daily goals in user model
    await User.findByIdAndUpdate(userId, {
      $unset: { dailyCalorieGoal: "", dailyProteinGoal: "", dailyFatGoal: "", dailyCarbGoal: "" }
    });
    
    res.json({ message: "Food logs and daily goals reset successfully!" });
  } catch (error) {
    console.error("❌ Error resetting food logs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});




module.exports = router;
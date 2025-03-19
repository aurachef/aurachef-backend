const express = require("express");
const router = express.Router();
const Rating = require("../models/Rating");
const authCheck = require("../middleware/AuthMiddleware");

// Add a new rating
router.post("/rate", authCheck, async (req, res) => {
  try {
    const { recipeId, rating, review = "" } = req.body;

    if (!recipeId || !rating) {
      return res
        .status(400)
        .json({ message: "Recipe ID and rating are required" });
    }

    // Check if the user has already rated this recipe
    const existingRating = await Rating.findOne({
      userId: req.user._id,
      recipeId,
    });

    if (existingRating) {
      existingRating.rating = rating;
      existingRating.review = review || existingRating.review;
      await existingRating.save();
      return res.status(200).json(existingRating);
    }
    const newRating = new Rating({
      userId: req.user._id,
      recipeId,
      rating,
      review,
    });

    await newRating.save();

    res.status(201).json(newRating);
  } catch (error) {
    console.error("❌ Error adding rating:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;

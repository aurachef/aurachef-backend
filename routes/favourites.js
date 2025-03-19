const express = require("express");
const router = express.Router();
const Favourite = require("../models/Favourite");
const AuthMiddleware = require("../middleware/AuthMiddleware");

// Check if a recipe is favorited by the user
router.get("/status/:recipeId", AuthMiddleware, async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user._id; // Consistently use _id

    const existingFav = await Favourite.findOne({ userId, recipeId });
    res.json({ isFavorited: !!existingFav });
  } catch (error) {
    console.error("❌ Error fetching favorite status:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Toggle Favorite (Add/Remove)
router.post("/toggle", AuthMiddleware, async (req, res) => {
  try {
    const { recipeId } = req.body;
    const userId = req.user._id; // Consistently use _id

    if (!recipeId) {
      return res.status(400).json({ message: "Recipe ID is required" });
    }

    // Log the incoming data
    console.log("📝 Toggle favorite request:", { userId, recipeId });

    // Check if already favorited
    const existingFav = await Favourite.findOne({ userId, recipeId });

    if (existingFav) {
      // Remove from favorites
      await Favourite.deleteOne({ userId, recipeId });
      console.log("✅ Removed from favorites");
      return res.json({ message: "Removed from favorites", isFavorited: false });
    }

    // Add to favorites
    const newFavorite = new Favourite({ userId, recipeId });
    await newFavorite.save();
    
    console.log("✅ Added to favorites:", newFavorite);
    res.json({ message: "Added to favorites", isFavorited: true });

  } catch (error) {
    console.error("❌ Error toggling favorite:", error.message);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message,
      details: {
        userId: req.user._id,
        recipeId: req.body.recipeId
      }
    });
  }
});

// Get all favorited recipes for the logged-in user
router.get("/", AuthMiddleware, async (req, res) => {
  try {
    const userId = req.user._id; // Consistently use _id

    // Find all favorite recipe IDs for the user
    const favorites = await Favourite.find({ userId }).populate("recipeId");

    // Extract the actual recipe details
    const favoriteRecipes = favorites.map(fav => fav.recipeId);

    res.json(favoriteRecipes);
  } catch (error) {
    console.error("❌ Error fetching favorite recipes:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
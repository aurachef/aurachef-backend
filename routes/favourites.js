const express = require("express");
const router = express.Router();
const Favourite = require("../models/Favourite");
const AuthMiddleware = require("../middleware/AuthMiddleware"); // Middleware to verify token

// ✅ Check if a recipe is favorited by the user
router.get("/status/:recipeId", AuthMiddleware, async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user.id;

    const existingFav = await Favourite.findOne({ userId, recipeId });

    res.json({ isFavorited: !!existingFav }); // If it exists, return true
  } catch (error) {
    console.error("❌ Error fetching favorite status:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Toggle Favorite (Add/Remove)
router.post("/toggle", AuthMiddleware, async (req, res) => {
  try {
    const { recipeId } = req.body;
    const userId = req.user.id;

    // Check if already favorited
    const existingFav = await Favourite.findOne({ userId, recipeId });

    if (existingFav) {
      // Remove from favorites
      await Favourite.deleteOne({ userId, recipeId });
      return res.json({ message: "Removed from favorites", isFavorited: false });
    }

    // Add to favorites
    await new Favourite({ userId, recipeId }).save();
    res.json({ message: "Added to favorites", isFavorited: true });

  } catch (error) {
    console.error("❌ Error toggling favorite:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get all favorited recipes for the logged-in user
router.get("/", AuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all favorite recipe IDs for the user
    const favorites = await Favourite.find({ userId }).populate("recipeId");

    // Extract the actual recipe details
    const favoriteRecipes = favorites.map(fav => fav.recipeId);

    res.json(favoriteRecipes);
  } catch (error) {
    console.error("❌ Error fetching favorite recipes:", error);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;

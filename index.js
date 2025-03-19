require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const recipeRoutes = require("./routes/recipe");
const ratingRoutes = require("./routes/rating");
const favouritesRoutes = require("./routes/favourites");
const userRoutes = require("./routes/users"); 
const calorietrackingRoutes = require("./routes/calorieTracking");
const path = require("path");

const app = express();
app.use(express.json());
// This handles URL-encoded form data (if you need it)
app.use(express.urlencoded({ extended: true }));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(cors());
app.use("/api/auth", authRoutes);
app.use("/api/recipe", recipeRoutes);
app.use("/api/rating", ratingRoutes);
app.use("/api/favourites", favouritesRoutes);
app.use("/api/users", userRoutes); // Changed from /api/user to /api/users
app.use("/api/calories", calorietrackingRoutes); // Mount the route




// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Default route
app.get("/", (req, res) => {
  res.send("AuraChef Backend Running!");
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
const mongoose = require("mongoose");

const favouriteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  recipeId: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe", required: true }
});

module.exports = mongoose.model("Favourite", favouriteSchema);
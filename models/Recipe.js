const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String, default: "" },
  prepTime: { type: Number, required: false }, // Changed to false
  cookTime: { type: Number, required: true },  // Changed to true
  servings: { type: Number, required: true },
  caloriesPerServing: { type: Number, required: false }, // Already false
  ingredients: [{ type: String, required: true }],
  instructions: [{ type: String, required: false }], // Already false
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Recipe", recipeSchema);

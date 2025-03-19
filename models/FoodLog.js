const mongoose = require("mongoose");

const foodLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  food: { type: String, required: true },
  calories: { type: Number, required: true },
  meal: { type: String, enum: ["Breakfast", "Lunch", "Dinner", "Snack"], required: true },
  time: { type: String, default: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  date: { type: Date, default: new Date() } // Store the date of the entry
});

module.exports = mongoose.model("FoodLog", foodLogSchema);

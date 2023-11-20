const mongoose = require("mongoose");

const ingredientSchema = new mongoose.Schema({
  item: {
    type: String,
    required: true,
    minLength: 2,
    trim: true,
  },
  measure: {
    type: String,
    required: true,
    minLength: 2,
    trim: true,
  },
});

const stepSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    minLength: 10,
    trim: true,
  },
  picture: {
    type: String,
  },
});

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minLength: 2,
  },
  picture: {
    type: String,
  },
  readyInMinutes: {
    type: Number,
    required: true,
  },
  servings: {
    type: Number,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "category",
  },
  tags: {
    type: [String],
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  ingredients: {
    type: [ingredientSchema],
    required: true,
  },
  steps: {
    type: [stepSchema],
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Recipe = mongoose.model("recipe", recipeSchema);

module.exports = Recipe;

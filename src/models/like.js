const mongoose = require("mongoose")

const likeSchema = new mongoose.Schema({
  authorUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  targetRecipe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "recipe",
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
})

const Like = mongoose.model("like", likeSchema)

module.exports = Like

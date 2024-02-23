const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    lowercase: true,
    trim: true,
    minLength: 2,
    maxLength: 16,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "USER",
    enum: ["USER", "ADMIN"],
  },
  followings: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "user",
  },
  followers: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "user",
  },
  favourites: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "recipe",
  },
  photo: String,
  date: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("user", userSchema);

module.exports = User;

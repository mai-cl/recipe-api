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
  role: String,
  followers: {
    type: Number,
    default: 0,
  },
  following: {
    type: Number,
    default: 0,
  },
  favourites: {
    type: Number,
    default: 0,
  },
  photo: String,
  date: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("user", userSchema);

module.exports = User;

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: String,
  followers: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "user",
  },
  following: {
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

module.exports.User = User;

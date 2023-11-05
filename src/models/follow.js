const mongoose = require("mongoose");

const followSchema = new mongoose.Schema({
  authorUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Follow = mongoose.model("follow", followSchema);

module.exports = Follow;

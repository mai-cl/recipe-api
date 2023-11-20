const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: 2,
  },
});

const Category = mongoose.model("category", categorySchema);

module.exports = Category;

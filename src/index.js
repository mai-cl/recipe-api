const express = require("express");
const mongoose = require("mongoose");

const app = express();
const port = 4000;

app.get("/", (req, res) => {
  res.status(200).send("Hello world!");
});

app.listen(port, () => {
  console.log("Listen on port " + port);
});

mongoose
  .connect("mongodb://127.0.0.1:27017/recipeDb")
  .then(() => console.log("Connected to mongoDb"))
  .catch(() => console.log("Error connecting to mongoDb"));

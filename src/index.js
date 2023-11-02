const express = require("express");
const mongoose = require("mongoose");
const usersRouter = require("./routes/user");

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use("/users", usersRouter);

app.listen(port, () => {
  console.log("Listen on port " + port);
});

mongoose
  .connect("mongodb://127.0.0.1:27017/recipeDb")
  .then(() => console.log("Connected to mongoDb"))
  .catch(() => console.log("Error connecting to mongoDb"));

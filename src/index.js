const express = require("express")
const mongoose = require("mongoose")
const usersRouter = require("./routes/user")
const followsRouter = require("./routes/follow")
const categoriesRouter = require("./routes/category")
const recipesRouter = require("./routes/recipe")

const app = express()
const port = process.env.PORT || 4000

app.use(express.json())
app.use("/users", usersRouter)
app.use("/follows", followsRouter)
app.use("/categories", categoriesRouter)
app.use("/recipes", recipesRouter)

app.listen(port, () => {
  console.log("Listen on port " + port)
})

mongoose
  .connect("mongodb://127.0.0.1:27017/recipeDb")
  .then(() => console.log("Connected to mongoDb"))
  .catch(() => console.log("Error connecting to mongoDb"))

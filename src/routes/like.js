const { body } = require("express-validator");
const mongoose = require("mongoose");
const router = require("express").Router();

const checkValidationResult = require("../middlewares/checkValidationResult");
const protect = require("../middlewares/protect");
const Like = require("../models/like");
const Recipe = require("../models/recipe");
const User = require("../models/user");

router.get("/", protect, async (req, res) => {
  try {
    const results = await Like.find({ authorUser: req.user.id });
    return res.status(200).json({
      status: "success",
      data: results,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

router.post(
  "/",
  protect,
  body("targetRecipe").isMongoId(),
  checkValidationResult,
  async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const existsLike = await Like.exists({
        authorUser: req.user.id,
        targetRecipe: req.body.targetRecipe,
      });

      if (existsLike) {
        return res.status(400).json({
          status: "fail",
          message: "The operation is not valid",
        });
      }

      const recipe = await Recipe.findById(req.body.targetRecipe);
      if (!recipe) {
        return res.status(400).json({
          status: "fail",
          message: "The recipe does not exists",
        });
      }

      const newLike = new Like({
        authorUser: req.user.id,
        targetRecipe: req.body.targetRecipe,
      });
      recipe.$inc("likes", 1);

      await recipe.save();
      await newLike.save();
      await User.findByIdAndUpdate(req.user.id, { $inc: { favourites: 1 } });

      await session.commitTransaction();
      session.endSession();

      return res.status(204).send();
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }
);

router.delete(
  "/",
  protect,
  body("targetRecipe").isMongoId(),
  checkValidationResult,
  async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const result = await Like.findOneAndDelete({
        authorUser: req.user.id,
        targetRecipe: req.body.targetRecipe,
      });
      if (!result) {
        return res.status(400).json({
          status: "fail",
          message: "Invalid operation",
        });
      }
      const recipe = await Recipe.findById(req.body.targetRecipe);
      recipe.$inc("likes", -1);
      await recipe.save();
      await User.findByIdAndUpdate(req.user.id, { $inc: { favourites: -1 } });

      await session.commitTransaction();
      session.endSession();

      return res.status(204).send();
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }
);

module.exports = router;

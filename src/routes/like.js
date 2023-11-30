const { query, body } = require("express-validator");
const Like = require("../models/like");
const checkValidationResult = require("../middlewares/checkValidationResult");
const Recipe = require("../models/recipe");
const User = require("../models/user");
const mongoose = require("mongoose");

const router = require("express").Router();

router.get(
  "/",
  query(["authorUser", "targetRecipe"]).optional().isMongoId(),
  checkValidationResult,
  async (req, res) => {
    try {
      const results = await Like.find(req.query);
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
  }
);

router.post(
  "/",
  body(["authorUser", "targetRecipe"]).isMongoId(),
  checkValidationResult,
  async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const existsLike = await Like.exists({
        authorUser: req.body.authorUser,
        targetRecipe: req.body.targetRecipe,
      });

      if (existsLike) {
        return res.status(400).json({
          status: "fail",
          message: "The operation is not valid",
        });
      }

      const existsUser = await User.findById(req.body.authorUser);
      if (!existsUser) {
        return res.status(400).json({
          status: "fail",
          message: "The user does not exists",
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
        authorUser: req.body.authorUser,
        targetRecipe: req.body.targetRecipe,
      });
      recipe.$inc("likes", 1);
      await recipe.save();
      await newLike.save();

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
  body(["authorUser", "targetRecipe"]).isMongoId(),
  checkValidationResult,
  async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const result = await Like.findOneAndDelete({
        authorUser: req.body.authorUser,
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

const router = require("express").Router();
const { param, query, body } = require("express-validator");

const User = require("../models/user");
const checkValidationResult = require("../middlewares/checkValidationResult");
const protect = require("../middlewares/protect");
const restricTo = require("../middlewares/restrictTo");
const mongoose = require("mongoose");

router.get(
  "/",
  protect,
  query("username")
    .optional()
    .isString()
    .trim()
    .customSanitizer((value) => new RegExp(value, "i")),
  async (req, res) => {
    try {
      const users = await User.find(req.query);
      return res.status(200).json({
        status: "success",
        data: users,
      });
    } catch (e) {
      return res.status(500).json({
        status: "error",
        message: e.message,
      });
    }
  }
);

router.get(
  "/:id",
  protect,
  param("id").isMongoId(),
  checkValidationResult,
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user)
        return res.status(404).json({
          status: "fail",
          message: `Doesn't exist an user with the id: ${req.params.id}`,
        });
      return res.status(200).json({
        status: "success",
        data: user,
      });
    } catch (e) {
      return res.status(500).json({
        status: "error",
        message: e.message,
      });
    }
  }
);

router.delete(
  "/:id",
  protect,
  restricTo(["ADMIN"]),
  param("id").isMongoId(),
  checkValidationResult,
  async (req, res) => {
    try {
      const deleteResult = await User.findByIdAndDelete(req.params.id);
      if (!deleteResult) {
        return res.status(404).json({
          status: "fail",
          message: "The user does not exists",
        });
      }
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }
);

router.post(
  "/:id/followings",
  protect,
  body(["targetUser"]).isMongoId(),
  checkValidationResult,
  async (req, res) => {
    if (req.user.id === req.body.targetUser || req.user.id !== req.params.id) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid operation",
      });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const targetUser = await User.findById(req.body.targetUser);
      if (!targetUser)
        return res.status(400).json({
          status: "fail",
          message: "The target user doesn't exist",
        });

      req.user.followings.addToSet(targetUser);
      await req.user.save();

      targetUser.followers.addToSet(req.user.id);
      await targetUser.save();

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

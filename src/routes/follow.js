const router = require("express").Router();
const mongoose = require("mongoose");
const { body, query } = require("express-validator");

const Follow = require("../models/follow");
const User = require("../models/user");
const checkValidationResult = require("../middlewares/checkValidationResult");
const protect = require("../middlewares/protect");

router.get(
  "/",
  protect,
  query(["authorUser", "targetUser"]).optional().isMongoId(),
  checkValidationResult,
  async (req, res) => {
    try {
      const allFollows = await Follow.find(req.query);
      return res.status(200).json({
        status: "success",
        data: allFollows,
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
  protect,
  body(["targetUser"]).isMongoId(),
  checkValidationResult,
  async (req, res) => {
    if (req.user.id === req.body.targetUser) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid operation",
      });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const existsFollow = await Follow.findOne({
        authorUser: req.user.id,
        targetUser: req.body.targetUser,
      });

      if (existsFollow)
        return res.status(400).json({
          status: "fail",
          message: "Invalid operation",
        });

      const targetUser = await User.findById(req.body.targetUser);
      if (!targetUser)
        return res.status(400).json({
          status: "fail",
          message: "The target user doesn't exist",
        });

      const newFollow = new Follow({
        authorUser: req.user.id,
        targetUser: req.body.targetUser,
      });

      await newFollow.save();
      await User.findByIdAndUpdate(req.body.targetUser, {
        $inc: { followers: 1 },
      });
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { following: 1 },
      });

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
  body(["targetUser"]).isMongoId(),
  checkValidationResult,
  async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const result = await Follow.findOneAndDelete({
        authorUser: req.user.id,
        targetUser: req.body.targetUser,
      });
      if (!result) {
        await session.commitTransaction();
        session.endSession();
        return res.status(400).json({
          status: "fail",
          message: "Operation could not be completed",
        });
      }
      await User.findByIdAndUpdate(req.body.targetUser, {
        $inc: { followers: -1 },
      });
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { following: -1 },
      });
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

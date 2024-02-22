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

router.get("/:id/followings", protect, async (req, res) => {
  if (req.user.id !== req.params.id) {
    return res.status(400).json({
      status: "fail",
      message: "Invalid operation",
    });
  }

  try {
    const followings = await User.findById(req.user.id).select(
      "followings -_id"
    );

    return res.status(200).json({
      status: "success",
      data: followings,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

router.get("/:id/followers", protect, async (req, res) => {
  if (req.user.id !== req.params.id) {
    return res.status(400).json({
      status: "fail",
      message: "Invalid operation",
    });
  }

  try {
    const followers = await User.findById(req.user.id).select("followers -_id");

    return res.status(200).json({
      status: "success",
      data: followers,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

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

      await User.findByIdAndUpdate(req.user.id, {
        $addToSet: { followings: targetUser },
      });
      await User.findByIdAndUpdate(req.body.targetUser, {
        $addToSet: { followers: req.user.id },
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
  "/:id/followings/:targetUserId",
  protect,
  param(["targetUserId"]).isMongoId(),
  checkValidationResult,
  async (req, res) => {
    if (
      req.user.id === req.params.targetUserId ||
      req.user.id !== req.params.id
    ) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid operation",
      });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const targetUserId = await User.findById(req.params.targetUserId);
      if (!targetUserId)
        return res.status(400).json({
          status: "fail",
          message: "The target user doesn't exist",
        });

      await User.findByIdAndUpdate(req.user.id, {
        $pull: { followings: req.params.targetUserId },
      });
      await User.findByIdAndUpdate(req.params.targetUserId, {
        $pull: { followers: req.user.id },
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

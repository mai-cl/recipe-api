const express = require("express");
const bcrypt = require("bcrypt");
const { User } = require("../models/user");
const { body, validationResult, param } = require("express-validator");
const uploadProfilePhoto = require("../utils/uploadProfilePhoto");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const users = await User.find();
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
});

router.get("/:id", param("id").isMongoId(), async (req, res) => {
  const requestValidationResult = validationResult(req);
  if (!requestValidationResult.isEmpty()) {
    return res.status(400).json({
      status: "fail",
      message: "The parameters aren't valid",
      errors: requestValidationResult.array(),
    });
  }

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
});

router.post(
  "/",
  [
    body("username").notEmpty().isLength({ min: 2, max: 16 }),
    body("email").notEmpty().isEmail(),
    body("password").notEmpty().isStrongPassword({
      minLength: 8,
      minNumbers: 1,
      minSymbols: 0,
      minUppercase: 1,
      minLowercase: 1,
    }),
    body("role").optional().isString(),
    body("photo").optional().isDataURI(),
  ],
  async (req, res) => {
    const requestValidationResult = validationResult(req);
    if (!requestValidationResult.isEmpty()) {
      return res.status(400).json({
        status: "fail",
        message: "The parameters aren't valid",
        errors: requestValidationResult.array(),
      });
    }

    try {
      const encryptedPassword = await bcrypt.hash(req.body.password, 10);

      const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: encryptedPassword,
        role: req.body.role || "USER",
        photo: null,
      });

      if (req.body.photo) {
        urlImg = await uploadProfilePhoto(req.body.photo);
        newUser.photo = urlImg;
      }

      const result = await newUser.save();

      return res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (e) {
      return res.status(500).json({
        status: "error",
        message: e.message,
      });
    }
  }
);

// Refactor
/* router.post("/:id/following", async (req, res) => {
  const followingUser = await User.findById(req.body.followingUserId);
  const user = await User.findById(req.params.id);
  user.following.push(followingUser._id);
  followingUser.followers.push(user._id);
  await followingUser.save();
  const resultUser = await user.save();
  return res.status(200).json({
    status: "sucess",
    data: resultUser,
  });
}); */

// Refactor
/* router.delete("/:id/following", async (req, res) => {
  const followingUser = await User.findById(req.body.followingUserId);
  const user = await User.findById(req.params.id);

  user.following = user.following.filter((id) => !id.equals(followingUser._id));
  followingUser.followers = followingUser.followers.filter(
    (id) => !id.equals(user._id)
  );
  await followingUser.save();
  const resultUser = await user.save();
  return res.status(200).json({
    status: "success",
    data: resultUser,
  });
}); */

module.exports = router;

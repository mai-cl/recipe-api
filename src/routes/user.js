const router = require("express").Router();
const bcrypt = require("bcrypt");
const { body, param, query } = require("express-validator");

const uploadProfilePhoto = require("../utils/uploadProfilePhoto");
const User = require("../models/user");
const checkValidationResult = require("../middlewares/checkValidationResult");
const checkIfPasswordsAreEqual = require("../middlewares/checkIfPasswordsAreEqual");
const protect = require("../middlewares/protect");
const restricTo = require("../middlewares/restrictTo");

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

router.post(
  "/",
  [
    body("username").notEmpty().isLength({ min: 2, max: 16 }),
    body("email").notEmpty().isEmail(),
    body(["password", "passwordConfirm"])
      .isStrongPassword({
        minLength: 8,
        minNumbers: 1,
        minSymbols: 0,
        minUppercase: 1,
        minLowercase: 1,
      })
      .trim(),
    body("role").optional().isString(),
    body("photo").optional().isDataURI(),
  ],
  checkValidationResult,
  checkIfPasswordsAreEqual,
  async (req, res) => {
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

      return res.status(201).json({
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

module.exports = router;

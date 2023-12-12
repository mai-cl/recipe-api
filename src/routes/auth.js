const { promisify } = require("util");
const router = require("express").Router();
const { body } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const checkValidationResult = require("../middlewares/checkValidationResult");
const checkIfPasswordsAreEqual = require("../middlewares/checkIfPasswordsAreEqual");
const checkIfEmailExists = require("../middlewares/checkIfEmailExists");
const checkIfUsernameExists = require("../middlewares/checkIfUsernameExists");

router.post(
  "/signup",
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
  ],
  checkIfUsernameExists,
  checkIfEmailExists,
  checkIfPasswordsAreEqual,
  async (req, res) => {
    try {
      const encryptedPassword = await bcrypt.hash(req.body.password, 10);

      const newUser = await User.create({
        username: req.body.username,
        email: req.body.email,
        password: encryptedPassword,
        role: "USER",
      });

      const token = await promisify(jwt.sign)(
        { username: req.body.username, email: req.body.email, id: newUser._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      return res.status(200).json({
        status: "success",
        token: token,
        data: {
          username: req.body.username,
          email: req.body.email,
        },
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
  "/login",
  [body("email").isEmail(), body("password").isString().trim()],
  checkValidationResult,
  async (req, res) => {
    try {
      const freshUser = await User.findOne({ email: req.body.email });
      if (!freshUser)
        return res.status(401).json({
          status: "fail",
          message: "The email or password are incorrect, please try again",
        });

      const result = await bcrypt.compare(
        req.body.password,
        freshUser.password
      );
      if (!result)
        return res.status(401).json({
          status: "fail",
          message: "The email or password are incorrect, please try again",
        });

      const token = await promisify(jwt.sign)(
        {
          email: freshUser.email,
          username: freshUser.username,
          id: freshUser._id,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRES_IN,
        }
      );

      return res.status(200).json({
        status: "success",
        token: token,
        data: {
          username: freshUser.username,
          email: freshUser.email,
        },
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }
);

module.exports = router;

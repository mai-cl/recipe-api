const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const { body } = require("express-validator");
const checkValidationResult = require("../middlewares/checkValidationResult");

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

      const token = jwt.sign(
        { email: freshUser.email, username: freshUser.username },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRES_IN,
        }
      );

      return res.status(200).json({
        status: "success",
        token: token,
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

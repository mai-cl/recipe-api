const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const User = require("../models/user");

module.exports = async (req, res, next) => {
  if (
    !req.get("Authorization") ||
    !req.get("Authorization").startsWith("Bearer ")
  ) {
    return res.status(401).json({
      status: "fail",
      message: "You are not logged in, please try again",
    });
  }

  let decoded;

  try {
    decoded = await promisify(jwt.verify)(
      req.get("Authorization").split(" ")[1],
      process.env.JWT_SECRET
    );
  } catch (error) {
    return res.status(401).json({
      status: "fail",
      message: "You are not logged in, please try again",
    });
  }

  try {
    const freshUser = await User.findById(decoded.id).select(
      "-password -followings -followers"
    );

    if (!freshUser)
      return res.status(401).json({
        status: "fail",
        message: "The user is no longer exists",
      });
    req.user = freshUser;
    return next();
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

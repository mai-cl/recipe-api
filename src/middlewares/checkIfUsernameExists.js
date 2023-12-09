const User = require("../models/user");

module.exports = async (req, res, next) => {
  try {
    const userExists = await User.findOne({ username: req.body.username });
    if (userExists)
      return res.status(400).json({
        status: "fail",
        message:
          "The username is already exists, please try again with another one",
      });
    return next();
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

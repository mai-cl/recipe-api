const User = require("../models/user");

module.exports = async (req, res, next) => {
  try {
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists)
      return res.status(404).json({
        status: "fail",
        message:
          "The provided email is already exists, please try with another one",
      });
    return next();
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

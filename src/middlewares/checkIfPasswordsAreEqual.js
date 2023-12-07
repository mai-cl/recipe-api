module.exports = (req, res, next) => {
  if (req.body.password === req.body.passwordConfirm) return next();
  return res.status(400).json({
    status: "fail",
    message: "The passwords are not equals, please try again",
  });
};

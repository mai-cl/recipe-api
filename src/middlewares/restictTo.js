module.exports = (roles) => {
  return async (req, res, next) => {
    const userRole = req.user.role;
    if (!roles.includes(userRole)) {
      return res.status(401).json({
        status: "fail",
        message: "You do not have permissions to access to requested resource",
      });
    }
    return next();
  };
};

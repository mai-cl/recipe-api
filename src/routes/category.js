const router = require("express").Router();
const { body, param } = require("express-validator");

const Category = require("../models/category");
const checkValidationResult = require("../middlewares/checkValidationResult");
const protect = require("../middlewares/protect");
const restrictTo = require("../middlewares/restrictTo");

router.get("/", async (req, res) => {
  try {
    const results = await Category.find();
    return res.status(200).json({
      status: "success",
      data: results,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

router.post(
  "/",
  protect,
  restrictTo(["ADMIN"]),
  body("name").exists().isString().isLength({ min: 2 }),
  checkValidationResult,
  async (req, res) => {
    const newCategory = new Category({
      name: req.body.name,
    });

    try {
      const result = await newCategory.save();
      return res.status(201).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }
);

router.delete(
  "/:id",
  protect,
  restrictTo(["ADMIN"]),
  param("id").exists().isMongoId(),
  checkValidationResult,
  async (req, res) => {
    try {
      const result = await Category.findByIdAndDelete(req.params.id);
      if (!result) {
        return res.status(400).json({
          status: "fail",
          message: "Operation could not be completed",
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

const router = require("express").Router();
const { body, validationResult, param } = require("express-validator");

const Category = require("../models/category");

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
  body("name").exists().isString().isLength({ min: 2 }),
  async (req, res) => {
    const requestValidationResult = validationResult(req);
    if (!requestValidationResult.isEmpty()) {
      return res.status(400).json({
        status: "fail",
        message: "The parameters aren't valid",
        errors: requestValidationResult.array(),
      });
    }

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

router.delete("/:id", param("id").exists().isMongoId(), async (req, res) => {
  const reqValidationResult = validationResult(req);
  if (!reqValidationResult.isEmpty()) {
    return res.status(400).json({
      status: "fail",
      message: "The parameters aren't valid",
      errors: reqValidationResult.array(),
    });
  }

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
});

module.exports = router;

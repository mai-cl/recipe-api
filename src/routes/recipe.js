const router = require("express").Router();

const { body, query, param } = require("express-validator");
const Recipe = require("../models/recipe");
const checkValidationResult = require("../middlewares/checkValidationResult");

router.get(
  "/",
  query("title")
    .optional()
    .isString()
    .trim()
    .customSanitizer((value) => new RegExp(value, "i")),
  checkValidationResult,
  async (req, res) => {
    try {
      const results = await Recipe.find(req.query)
        .select("title picture category readyInMinutes servings date author")
        .populate("author", "username email")
        .populate("category")
        .exec();
      return res.status(200).json({
        status: "success",
        data: results,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }
);

router.post(
  "/",
  [
    body(["author", "category"]).isMongoId(),
    body(["readyInMinutes", "servings"]).isNumeric(),
    body("title").isString(),
    body("tags.*").optional().isString(),
    body(["steps", "ingredients"]).isArray({ min: 1 }),
    body(["steps.*", "ingredients.*"]).isObject({ strict: true }),
    body("steps.*.description").isString(),
    body("steps.*.picture").optional().isString(),
    body(["ingredients.*.item", "ingredients.*.measure"]).isString(),
  ],
  checkValidationResult,
  async (req, res) => {
    try {
      const newRecipe = new Recipe({
        author: req.body.author,
        readyInMinutes: req.body.readyInMinutes,
        servings: req.body.servings,
        title: req.body.title,
        category: req.body.category,
        tags: req.body.tags,
        steps: req.body.steps,
        ingredients: req.body.ingredients,
      });

      const result = await newRecipe.save();
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
  param("id").isMongoId(),
  checkValidationResult,
  async (req, res) => {
    try {
      const result = await Recipe.findByIdAndDelete(req.params.id);
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

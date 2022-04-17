// ----------------- MANAGE ADMIN RELATED STUFF -------------
// Packages
const { body } = require("express-validator/check");
const express = require("express");

// * DOC: Custom Middleware Local Authenticaton: isAuth();
const isAuth = require("../middleware/is-auth");

const adminController = require("../controllers/admin");

const router = express.Router();

// WHENEVER A REQUEST REACHES THE ROUTE, EXECUTE THE REFERENCED FUNCTION AS CALLBACK
// ! isAuth - Authorization

// ------------- CREATING PRODUCT -----------
router.get("/add-product", isAuth, adminController.getAddProduct);
router.post(
  "/add-product",
  isAuth,
  [
    // ! INPUT VALIDATION
    body(
      ["title"],
      "Please enter a password with only numbers and text and at least 5 characters."
    )
      .isString()
      .isLength({
        min: 3,
      })
      .trim(),
    // body(["image"], "Please provide a valid url.").isURL(),
    // must have decimal places
    body(["price"], "Please enter a valid Price").isFloat(),
    body(
      ["description"],
      "Please enter a valid description with a minimum length of 5."
    )
      .isLength({
        min: 5,
        max: 100,
      })
      .trim(),
  ],
  adminController.postAddProduct
);

// ----------------- GET PRODUCTS ------------
router.get("/products", isAuth, adminController.getProducts);

// ---------------- EDIT PRODUCT ------------
router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);
router.post(
  "/edit-product",
  isAuth,
  [
    body(
      ["title"],
      "Please enter a password with only numbers and text and at least 5 characters."
    )
      .isString()
      .isLength({
        min: 3,
      })
      .trim(),
    // body(["image"], "Please provide a valid url.").isURL(),
    // must have decimal places
    body(["price"], "Please enter a valid Price").isFloat(),
    body(
      ["description"],
      "Please enter a valid description with a minimum length of 5."
    )
      .isLength({
        min: 5,
        max: 100,
      })
      .trim(),
  ],

  adminController.postEditProduct
);

// ----------------- DELETE PRODUCT ------------
router.post("/delete-product", isAuth, adminController.postDeleteProduct);

module.exports = router;

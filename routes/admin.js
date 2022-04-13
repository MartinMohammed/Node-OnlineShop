// ----------------- MANAGE ADMIN RELATED STUFF -------------
//  ROUTE FOR (app.use("/admin"))
const path = require("path");
const express = require("express");
const rootDir = require("../util/path");

const adminController = require("../controllers/admin");

const router = express.Router();

// WHENEVER A REQUEST REACHES THE ROUTE, EXECUTE THE REFERENCED FUNCTION AS CALLBACK

// ------------- CREATING PRODUCT -----------
router.get("/add-product", adminController.getAddProduct);
router.post("/add-product", adminController.postAddProduct);

// ----------------- GET PRODUCTS ------------
router.get("/products", adminController.getProducts);

// ---------------- EDIT PRODUCT ------------
router.get("/edit-product/:productId", adminController.getEditProduct);
router.post("/edit-product", adminController.postEditProduct);

// ----------------- DELETE PRODUCT ------------
router.post("/delete-product", adminController.postDeleteProduct);

module.exports = router;

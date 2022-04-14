// ----------------- MANAGE ADMIN RELATED STUFF -------------
//  ROUTE FOR (app.use("/admin"))
const path = require("path");
const express = require("express");
const rootDir = require("../util/path");

// * DOC: Custom Middleware Local Authenticaton: isAuth();
const isAuth = require("../middleware/is-auth");

const adminController = require("../controllers/admin");

const router = express.Router();

// WHENEVER A REQUEST REACHES THE ROUTE, EXECUTE THE REFERENCED FUNCTION AS CALLBACK

// ------------- CREATING PRODUCT -----------
router.get("/add-product", isAuth, adminController.getAddProduct);
router.post("/add-product", isAuth, adminController.postAddProduct);

// ----------------- GET PRODUCTS ------------
router.get("/products", isAuth, adminController.getProducts);

// ---------------- EDIT PRODUCT ------------
router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);
router.post("/edit-product", isAuth, adminController.postEditProduct);

// ----------------- DELETE PRODUCT ------------
router.post("/delete-product", isAuth, adminController.postDeleteProduct);

module.exports = router;

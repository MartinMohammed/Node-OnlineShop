const path = require("path");
const express = require("express");
const rootDir = require("../util/path");

// const adminController = require("../controllers/MySQL/admin");
const adminController = require("../controllers/MongoDB/admin");

const router = express.Router();

// pass reference to the function, tell express router should take the function and store it
// whenever a request reaches thi sroute, it should go adead and execute it.
// /admin/add-product => GET

router.get("/add-product", adminController.getAddProduct);
// /admin/add-product => POST
router.post("/add-product", adminController.postAddProduct);

router.get("/products", adminController.getProducts);

router.get("/edit-product/:productId", adminController.getEditProduct);

router.post("/edit-product", adminController.postEditProduct);

router.post("/delete-product", adminController.postDeleteProduct);
module.exports = router;

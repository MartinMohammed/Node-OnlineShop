const path = require("path");

const express = require("express");

const rootDir = require("../util/path");
// const shopController = require("../controllers/MySQL/shop");
const shopController = require("../controllers/MongoDB/shop");

const router = express.Router();

router.get("/", shopController.getHomepage);
// // router.get("/checkout", shopController.getCheckout);

// router.get("/cart", shopController.getCart);
// router.post("/cart", shopController.postCart);

// router.post("/cart-delete-item", shopController.postCartDeleteItem);
// router.post("/create-order", shopController.postOrder);

// router.get("/orders", shopController.getOrders);
router.get("/products", shopController.getProducts);
// // dynamic segment / variable segement such as product id
// // dyamic route handler should be always last of its sub path
router.get("/products/:productId", shopController.getProduct);

module.exports = router;

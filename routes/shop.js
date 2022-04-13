// ----------------- MANAGE VISITOR RELATED STUFF -------------
const path = require("path");
const express = require("express");

const rootDir = require("../util/path");
const shopController = require("../controllers/shop");

const router = express.Router();

router.get("/", shopController.getHomepage);

// ------------- CART ------------
router.get("/cart", shopController.getCart);
router.post("/cart", shopController.postCart);
router.post("/cart-delete-item", shopController.postCartDeleteItem);

// ------------- ORDER ------------
router.post("/create-order", shopController.postOrder);
router.get("/orders", shopController.getOrders);

// ---------------- GET PRODUCT/S ------------
router.get("/products", shopController.getProducts);
// dynamic segment / variable segement such as product id
// dyamic route handler should be always last of its sub path
router.get("/products/:productId", shopController.getProduct);

module.exports = router;

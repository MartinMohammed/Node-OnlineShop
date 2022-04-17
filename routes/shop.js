// ----------------- MANAGE VISITOR RELATED STUFF -------------
const express = require("express");

const rootDir = require("../util/path");
const shopController = require("../controllers/shop");

// * DOC: Custom Middleware Local Authenticaton: isAuth();
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get("/", shopController.getHomepage);

// ------------- CART ------------
router.get("/cart", isAuth, shopController.getCart);
router.post("/cart", isAuth, shopController.postCart);
router.post("/cart-delete-item", isAuth, shopController.postCartDeleteItem);

// ------------- ORDER ------------
router.post("/create-order", isAuth, shopController.postOrder);
router.get("/orders", isAuth, shopController.getOrders);

// ---------------- GET PRODUCT/S ------------
router.get("/products", shopController.getProducts);
// dynamic segment / variable segement such as product id
// dyamic route handler should be always last of its sub path
router.get("/products/:productId", shopController.getProduct);

// ---------------- ORDER INVOICES -----------
router.get("/orders/:orderId", isAuth, shopController.getInvoice);

module.exports = router;

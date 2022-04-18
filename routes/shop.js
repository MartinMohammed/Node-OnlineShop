// ----------------- MANAGE VISITOR RELATED STUFF -------------
const express = require("express");

const rootDir = require("../util/path");
const shopController = require("../controllers/shop");

// * DOC: Custom Middleware Local Authenticaton: isAuth();
const isAuth = require("../middleware/is-auth");

const router = express.Router();
// ------------- HOMEPAGE ------------
router.get("/", shopController.getHomepage);

// ---------------- GET PRODUCT/S ------------
router.get("/products", shopController.getProducts);
// dynamic segment / variable segement such as product id
// dyamic route handler should be always last of its sub path
router.get("/products/:productId", shopController.getProduct);

// ------------- CART ------------
router.get("/cart", isAuth, shopController.getCart);
router.post("/cart", isAuth, shopController.postCart);
router.post("/cart-delete-item", isAuth, shopController.postCartDeleteItem);

// ------------- CHECKOUT PAGE ------------
router.get("/checkout", isAuth, shopController.getCheckout);

// User has completed the payment process: save the order in the database
router.get("/checkout/success", shopController.getCheckoutSuccess);
// Payment process failed: back to the checkout page
router.get("/checkout/cancel", shopController.getCheckout);

// ------------- ORDER ------------
router.get("/orders", isAuth, shopController.getOrders);
// ---------------- ORDER INVOICES -----------
router.get("/orders/:orderId", isAuth, shopController.getInvoice);

module.exports = router;

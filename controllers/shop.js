// =============== CONTROLLER FOR "/ route" ===========

const Product = require("../models/product");
const Order = require("../models/order");
// const User = require("../models/user");
// const Cart = require(../models/cart")

exports.getHomepage = (req, res, next) => {
  // GET ALL THE PRODUCTS
  Product.find()
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "Homepage",
        path: "/",
      });
    })
    .catch((err) => console.log(err));
};

exports.getProducts = (req, res, next) => {
  // GET ALL THE PRODUCTS
  Product.find()
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
      });
    })
    .catch((err) => console.log(err));
};

exports.getProduct = (req, res, next) => {
  // GET SPECIFIC PRODUCT
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",

        existingDetails: product !== undefined,
      });
    })
    .catch((err) => console.log(err));
};

exports.getCart = (req, res, next) => {
  // RETURN THE CART OF THE GIVEN USER
  // * populate the cartItem with its corresponding document (product)
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items;
      res.render("shop/cart", {
        pageTitle: "Cart",
        path: "/cart",
        products,
      });
    })
    .catch((err) => console.log(err));
};

// ADD PRODUCT TO THE CART
exports.postCart = (req, res, next) => {
  // prodId from hidden input field
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      // *  user from app.js is an instance of the User Model (access to its static / normal methods)
      // return another promise / product is a schema instance
      return req.user.addToCart(product);
    })
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
};

exports.postCartDeleteItem = (req, res, next) => {
  const productId = req.body.productId;
  req.user
    .removeFromCart(productId)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
};

// GET THE ORDERS FROM THE CURRENT ACTIVE USER => SESSION
exports.getOrders = (req, res, next) => {
  // nested fields => path
  Order.find({ "user.userId": req.session.user._id })
    .then((orders) => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders,
      });
    })
    .catch((err) => console.log(err));
};
exports.postOrder = (req, res, next) => {
  // it will populate "cart.items.productId": {productData such as title...} / insert the product (document) where the id field is
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      // * -------------- IN ACCORDANCE WITH THE ORDER MODEL/ SCHEMA -------------
      // updated cart items now with product data
      // return the according array of products to the order schema
      const products = user.cart.items.map((i) => {
        // * properly object for the order model / mongoose will autoselect _id if no spread operator
        // ! with ._doc just get really access to the data and not to the bunch of metadata

        // * PLEASE REFERENCE TO ORDER MODEL => productitem
        return { quantity: i.quantity, productData: { ...i.productId._doc } };
      });
      const order = new Order({
        // needs to get products/ userData and
        // * USERDATA
        user: {
          email: req.user.email,
          userId: req.user,
        },
        // * PRODUCTS ARRAY
        // [{quantity, productId}]
        products: products,
      });
      order.save();
    })
    .then((result) => {
      console.log("successfully placed the order");
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch((err) => console.log(err));
};

// * ---------------------------- USING MONGODB ------------------------
const Product = require("../../models/MongoDB/product");
const User = require("../../models/MongoDB/user");
// const Cart = require("../../models/MongoDB/cart")

exports.getHomepage = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "Homagepage",
        path: "/",
      });
    })
    .catch((err) => console.log(err));
};

exports.getProducts = (req, res, next) => {
  // static method for mongodb - returns a promise
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
  const prodId = req.params.productId;
  //   own written Method
  Product.findById(prodId).then((product) => {
    res.render("shop/product-detail", {
      pageTitle: product.title,
      path: "/products",
      existingDetails: product !== undefined,
      product,
    });
  });
};

exports.getCart = (req, res, next) => {
  // return the cart of the current user
  req.user
    .getCart()
    .then((products) => {
      res.render("shop/cart", {
        pageTitle: "Cart",
        path: "/cart",
        products,
      });
    })
    .catch((err) => console.log(err));
};

exports.postCart = (req, res, next) => {
  // prodId from hidden input field
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      // * Now user (app.js) is an instance of the User class (access to its static / normal methods)
      // return another promise
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
    .deleteItemFromCart(productId)
    .then((result) => {
      console.log(result);
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
};
exports.getOrders = (req, res, next) => {
  req.user
    .getOrders()
    .then((orders) => {
      console.log(orders);
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
      });
    })
    .catch((err) => console.log(err));
};
exports.postOrder = (req, res, next) => {
  req.user
    .addOrder()
    .then((result) => {
      console.log(result, "successfully placed the order");
      res.redirect("/orders");
    })
    .catch((err) => console.log(err));
};

// * ---------------------------- USING MONGODB ------------------------
const Product = require("../../models/MongoDB/product");
// const Cart = require("../../models/MongoDB/cart")

exports.getHomepage = (req, res, next) => {
  Product.fetchAll()
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
  Product.fetchAll()
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

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      // * Now user is an instance of the User class (access to its static / normal methods)
      // return another promise
      return req.user.addToCart(product);
    })
    .then((result) => {
      console.log(result);
    })
    .catch((err) => console.log(err));
};

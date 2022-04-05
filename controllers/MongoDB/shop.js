// * ---------------------------- USING MONGODB ------------------------
const Product = require("../../models/MongoDB/product");
const User = require("../../models/MongoDB/user");
const Order = require("../../models/MongoDB/order");
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
  // return the cart of the current user
  // populate the cartItem with its corresponding document (product)
  req.user
    // on instance does not return a promise so we need execPopulate() to do it
    .populate("cart.items.productId")
    // not longer available
    // .execPopulate()
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

exports.postCart = (req, res, next) => {
  // prodId from hidden input field
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      // * Now user (app.js) is an instance of the User class (access to its static / normal methods)
      // return another promise / product is a schema instance
      // access the schema methods (which will apply for instances of the schema) just by the name
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
      console.log(result);
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
};
exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
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
  // it will populate "cart.items.productId": {productData such as title...}
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      // * -------------- IN ACCORDANCE WITH THE ORDER MODEL/ SCHEMA -------------
      // updated cart items now with product data
      // return the according array of products to the order schema
      const products = user.cart.items.map((i) => {
        // * properly object for the order model / mongoose will autoselect _id if no spread operator
        // ! with ._doc just get really access to the data and not to the bunch of metadata
        return { quantity: i.quantity, productData: { ...i.productId._doc } };
      });
      const order = new Order({
        // needs to get products/ userData and
        // * USERDATA
        user: {
          name: req.user.name,
          userId: req.user,
        },
        // [{quantity, productId}]
        // * PRODUCTS ARRAY
        products: products,
      });
      order.save();
    })
    .then((result) => {
      console.log("successfully placed the order");
      // empty the cart of the user
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch((err) => console.log(err));
};

// =============== CONTROLLER FOR "/admin" route ===============
// Packages
const { validationResult } = require("express-validator/check");

// Custom functions
const fileHelper = require("../util/fileHelper.js");

// Models
const Product = require("../models/product");

// ---------------------------- PRODUCTS --------------------------
exports.getAddProduct = (req, res, next) => {
  // WORKING ON ROUTE PROTECTION - RESTRICT THE ACCESS OF THE USER
  // ! express-session - MIDDLEWARE !
  // USER IS NOT LOGGEDIN
  if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  }
  // USER IS LOGGEDIN
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: [],
  });
};

exports.postAddProduct = (req, res, next) => {
  const { title, price, description } = req.body;
  const image = req.file;
  // if it is not set: multer did declined the incoming file => fileFilter || no file was provided
  if (!image) {
    // INVALID INPUT - Validation
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      errorMessage: "Attached file is not an image.",
      // provide previous input if the user
      product: {
        title,
        price,
        description,
      },
      validationErrors: [],
    });
  }
  // The path to the file in the filesystem images/file.MIME
  const imageUrl = image.path;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      errorMessage: errors.array()[0].msg,
      // provide previous input if the user
      product: {
        title,
        price,
        image,
        description,
      },
      // * For DYNAMICAL styling : show user which input fields are unvalid
      validationErrors: errors.array(),
    });
  }
  // create Product from Model
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    // conveniently pass entire user object } mongoose pick the id from that object
    userId: req.session.user,
  });
  // * now the product is 'eligible' to mongoose sugar syntax respectively methods
  product
    // Housemade method provided by mongoose
    .save()
    // actually we get a promise back but mongoose still gives us a .then method
    .then((result) => {
      res.redirect("/admin/products");
    })
    .catch((err) => {
      // ! IF Temporary Issue
      //   return res.status(500).render("admin/edit-product", {
      //     pageTitle: "Add Product",
      //     path: "/admin/add-product",
      //     editing: false,
      //     hasError: true,
      //     errorMessage: "Database operation failed, please try again.",
      //     // provide previous input if the user
      //     product: {
      //       title,
      //       price,
      //       description,
      //     },
      //     validationErrors: [],
      //   });
      //  ! ELSE LASTING ISSUE
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// RENDER THE ADMIN: ONLY ONE PRODUCT WITH ITS DATA
exports.getEditProduct = (req, res, next) => {
  const loggedInUser = req.session.user;

  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  // ! PRODUCTID IS ONLY VALID IF THE LENGTH IS 24 == ObjectId length of mongodb
  const productId = req.params.productId;
  if (productId.length !== 24) {
    return res.redirect("/admin/products");
  }

  // ! ------------ AUTHORIZATON ----------
  // only allowed to edit a product that he made
  Product.findById(productId)
    .then((product) => {
      // redirect either if he tries to edit a unvalid product or he is not the owner of the product
      if (
        !product ||
        product.userId.toString() !== loggedInUser._id.toString()
      ) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: true,
        product,
        hasError: false,
        errorMessage: null,
        validationErrors: [],
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const loggedInUser = req.session.user;
  // GET THE CHANGES FROM THE FORM
  const { title, price, description, productId } = req.body;
  const image = req.file;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: true,
      hasError: true,
      product: {
        title,
        price,
        description,
        _id: productId,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  // GET THE SPECIFIC PRODUCT FROM THE COLLECTION
  Product.findById(productId)
    .then((product) => {
      // ! ------------ AUTHORIZATON ----------
      // Only allowed to make changed if he is the creator of the product
      if (loggedInUser._id.toString() !== product.userId.toString()) {
        return res.redirect("/");
      }

      // UPDATE THE PRODUCT
      product.title = title;
      product.price = price;
      product.description = description;
      // * If present: He wants to update the old image of the product in the database
      if (image) {
        // ! fire and forget manner => execute : no then or result
        // ! delete the old image in the file system
        fileHelper.deleteFile(product.imageUrl);
        product.imageUrl = image.path;
      }
      // Save the changes in the database
      return product.save().then((result) => {
        res.redirect("/admin/products");
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.deleteProduct = (req, res, next) => {
  const loggedInUser = req.session.user;
  const productId = req.params.productId;
  // ----------- RACE CONDITION => Where deleteOne is earlier finish than finding ----------
  Product.findById(productId)
    .then((product) => {
      if (!product) {
        // Product not found
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      }
      fileHelper.deleteFile(product.imageUrl);
      // ! ------ AUTHORIZATION -----
      return Product.deleteOne({ _id: productId, userId: loggedInUser._id });
    })
    .then(() => {
      // For .json responses status code automatically set to 200
      res.status(200).json({
        message: "Product was successful deleted from the database!",
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: "Deleting product from database failed.",
      });
    });
};

exports.getProducts = (req, res, next) => {
  const loggedInUser = req.session.user;
  // ! ------------ AUTHORIZATON ----------
  // * EACH PRODUCT IS ASSOCIATED WITH ITS CREATOR
  Product.find({ userId: loggedInUser._id })
    .then((products) => {
      res.render("admin/products", {
        path: "/admin/products",
        pageTitle: "Admin Panel - Products",
        prods: products,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

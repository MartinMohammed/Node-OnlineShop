// =============== CONTROLLER FOR "/admin route" ===========
const { validationResult } = require("express-validator/check");
const fileHelper = require("../util/fileHelper.js");

const Product = require("../models/product");

// ------------------- ADD PRODUCT ---------------
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
  // if it is not set: multer did declined the incoming file => fileFilter
  if (!image) {
    // invalid input
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
  // the path to the file in the file system
  const imageUrl = image.path;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // console.log(errors.array());
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
      // * For dynamical styling : show user which fields are unvalid
      validationErrors: errors.array(),
    });
  }
  // * our Product schema from product.js model; map the different values we defined in our schema
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
    // .save() is housemade method provided by mongoose
    .save()
    // actually we get a promise back but mongoose still gives us a .then method
    .then((result) => {
      console.log("Created Product");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      // ! IF Temporary Isse
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
      // return res.redirect("/500");
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// ------------------- EDIT PRODUCT ---------------
// RENDER THE ADMIN ONLY ONE PRODUCT WITH ITS DATA
exports.getEditProduct = (req, res, next) => {
  const loggedInUser = req.session.user;

  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const productId = req.params.productId;
  // ! PRODUCTID IS ONLY VALID IF THE LENGTH IS 24 == ObjectId length of mongodb
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
  // * full mongoose object with its methods / not normal js object
  Product.findById(productId)
    // UPDATE THE PRODUCT
    .then((product) => {
      // ! ------------ AUTHORIZATON ----------
      // ONly allowed to make changed if he is the creator of the product
      if (loggedInUser._id.toString() !== product.userId.toString()) {
        return res.redirect("/");
      }

      product.title = title;
      product.price = price;
      product.description = description;
      // * If not present: do not update the left image in the database.
      if (image) {
        // * else he wants to update the old product image
        // ! fire and forget manner => execute : no then or result
        fileHelper.deleteFile(product.imageUrl);

        // image.path = absolute path
        product.imageUrl = image.path;
        // ! delete the old image
      }
      // saving it back into db = SAME _id = replace the old one with new one

      // return Promise which resolves and in turn return another promise
      // next promise function gets only called if the previous one was either fullfilled
      // = .then or rejected = .catch
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

exports.postDeleteProduct = (req, res, next) => {
  const loggedInUser = req.session.user;
  const productId = req.body.productId;
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
      console.log("Destroyed Product");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProducts = (req, res, next) => {
  const loggedInUser = req.session.user;

  // ! ------------ AUTHORIZATON ----------
  // * EACH PRODUCT IS ASSOCIATED WITH ITS CREATOR
  // .cursor() will give us access to the cursor / each async || next => will give us option to iterate through
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

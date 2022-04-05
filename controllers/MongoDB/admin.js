// * ---------------------------- USING MONGODB ------------------------
// const mongodb = require("mongodb");
const Product = require("../../models/MongoDB/product");
// const ObjectId = mongodb.ObjectId;

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
  });
};

exports.postAddProduct = (req, res, next) => {
  const { title, price, description, imageUrl } = req.body;
  // * our Product schema from product.js model; map the different values we defined in our schema
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    // conveniently pass entire user object } mongoose pick the id from that object
    userId: req.user,
  });
  // now the product is 'eligible' to mongoose sugar syntax respectively methods
  product
    // .save() is housemade method provided by mongoose
    .save()
    // actually we get a promise back but mongoose still gives us a .then method
    .then((result) => {
      console.log("Created Product");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    res.redirect("/");
  }
  const productId = req.params.productId;
  Product.findById(productId)
    .then((product) => {
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: true,
        product,
      });
    })
    .catch((err) => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const {
    productId,
    title: updatedTitle,
    price: updatedPrice,
    description: updatedDescription,
    imageUrl: updatedImageURl,
  } = req.body;
  // // productId = string of the objectId
  // const updatedProduct = new Product(
  //   updatedTitle,
  //   updatedPrice,
  //   updatedDescription,
  //   updatedImageURl,
  //   productId
  // );
  // full mongoose object with its methods / not normal js object
  Product.findById(productId)
    .then((product) => {
      // modifying data of product from db
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDescription;
      product.imageUrl = updatedImageURl;
      // saving it back into db = updated behind the scenes
      return product.save();
    })
    .then((result) => {
      // // if id is defined (it is), it will update the corresponding item in the database
      // // with the new one
      // updatedProduct.save();
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  Product.findOneAndRemove(productId)
    .then(() => {
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProducts = (req, res, next) => {
  // * .cursor() will give us access to the cursor / each async || next => will give us option to iterate through
  // comma
  Product.find()
    // ! ------------- SPECIAL MONGOOSE METHODS: Selection, populate
    // //  select which kind of data should be received / (which fields to select/ unselect)
    // // * string space seperated : '-' means exclude productId
    // .select("title price -_id")
    // // * tell mongoose to populate a certain filed with all the detail information and not just the id
    // // * now userId is not just the id instead the full object / because of the ref config
    // // * same like select can be done with populate('pathToField(nested path)', 'name')
    // // populate related field and fetch the related data
    // .populate("userId")
    .then((products) => {
      res.render("admin/products", {
        path: "/admin/products",
        pageTitle: "Admin Panel - Products",
        prods: products,
      });
    })
    .catch((err) => console.log(err));
};

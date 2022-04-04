// ----------------- ADMIN PANEL - CONTROLLER ---------------------
// ! ---------------------------- USING MYSQL ------------------------
const Product = require("../../models/MySQL/product");
const Cart = require("../../models/MySQL/cart");

// --------------- EVERYTHING PRODUCT RELATED ------------

// action
exports.getAddProduct = (req, res, next) => {
  // reuse same page for either edit or add product
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    //-------------- FOR HANDLEBARS -------------
    // activeShop: false,
    // activeAddProduct: true,
    // formsCSS: true,
    // productCSS: true,
  });
};

exports.postAddProduct = (req, res, next) => {
  //   products.push({ title: req.body.title });
  // create new instance of the product blue print
  // extract parsed form input of req.body

  const { title, imageUrl, price, description } = req.body;
  // * "Create" creates a new element based on that model and immediately saves it to the database
  // * "build" creates a new object based on the mdoel but only in js and then we need to save it manually

  // set up associations, sequilize add special methods depending on the association you added
  // e.g. create a new associated object (product) = Product.belongsTo(User, {}) & User.hasMany(Product) => ModelName
  req.user
    .createProduct({
      title,
      imageUrl,
      price,
      description,
      // ! must contain the primary key of users table / but there is a more elegant way
      // userId: req.user.id,
    })
    .then((result) => {
      console.log(result);
      res.redirect("/products");
    })
    .catch((err) => {
      console.log(err);
    });

  // const product = new Product(title, imageUrl, price, description);
  // product
  //   .save()
  //   .then((result) => {
  //     // result just some metadata about the changes in the table
  //     console.table(result);
  //     res.redirect("/products");
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
};
exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const productId = req.params.productId;
  // Only find the products associated to the current user
  req.user
    .getProducts({ where: { id: productId } })
    .then((products) => {
      const product = products[0];
      if (!product) {
        console.log("Product was not found");
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: true,
        product,
      });
    })
    .catch((err) => console.trace("fetch product in getEditProduct"));
};

exports.postEditProduct = (req, res, next) => {
  // Data of the 'updated' product from the edit section - the productId stays consistent
  const {
    productId,
    title: updatedTitle,
    price: updatedPrice,
    description: updatedDescription,
    imageUrl: updatedImageUrl,
  } = req.body;
  const updatedProduct = new Product(
    productId,
    updatedTitle,
    updatedImageUrl,
    updatedPrice,
    updatedDescription
  );
  Product.findByPk(productId)
    .then((product) => {
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDescription;
      product.imageUrl = updatedImageUrl;
      // Another method provided by sequelize and this now takes the product as we edit it and
      // saves it back to the database (if not exist yet, create new one, else if its exist => overwrite or update
      // old one with our new values )

      // return promise out of the Product Model static method to chain .then methods
      return product.save();
    })
    .then((result) => {
      console.log("Updated Product");
      res.redirect("/admin/products");
    })
    .catch((err) =>
      console.trace(
        "PostEditProduct - fetch all products and send the updated version back to the db."
      )
    );
  // .save method takes the productId, search through the product data and look for an exisiting product if so
  // replace/override the old product with the same product id  with the updatedProduct
  // updatedProduct.save();
};

exports.postDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  Product.findByPk(productId)
    .then((product) => {
      return product.destroy();
    })
    .then((result) => {
      console.log("Product, successfully deleted");
      res.redirect("/admin/products");
    })
    .catch((err) => console.trace("postDeleteProduct: delete Product in db."));
  // // DELETE THE PRODUCT IN THE PRODUCTS STORAGE/ MODEL
  // // DELETE THE PRODUCT IN THE CART STORAGE/ MODEL
  // Product.delete(productId);
};

exports.getProducts = (req, res, next) => {
  // FOR DOCUMENTATION LOOK --> SHOP.JS controller
  // get all related products from the user
  req.user
    .getProducts()
    // Product.findAll()
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Panel - Products",
        path: "/admin/products",
        // //-------------- FOR HANDLEBARS -------------
        // hasProducts: products.length > 0,
        // activeShop: true,
        // activeAddProduct: true,
      });
    })
    .catch((err) => console.trace("fetch products for admin.js"));
};

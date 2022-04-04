const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const handlebars = require("express-handlebars");
const mongoose = require("mongoose");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const errorsController = require("./controllers/errors");

// * ---------------------------- USING MONGODB ------------------------
const mongooseConnect = require("./util/database").mongooseConnect;
const User = require("./models/MongoDB/user");

// ! ---------------------------- USING MYSQL ------------------------
// const sequilize = require("./util/database");
// const Product = require("./models/product");
// const User = require("./models/user");
// const Cart = require("./models/cart");
// const CartItem = require("./models/cart-item");

// const Order = require("./models/order");
// const OrderItem = require("./models/order-item");

const app = express();

// set global configuration value on our express application (keys, config items) -> can be accessed with app.get();
// reserved keys --> views (dir to dynamic views - default = /views) & views engine -> tell express for any dynnmaic templates trying to render
//  and there will be a special function for doing that (please use what is specified by us)

// --------------------- APPLICATION CONFIGURATION ---------------------
const VIEW_ENGINE = ["pug", "hbs", "ejs"];
const CURRENT_VIEW_ENGINE = VIEW_ENGINE[2];

app.set("view engine", CURRENT_VIEW_ENGINE);
app.set("views", `views/${CURRENT_VIEW_ENGINE}`);

// safer than query method
// .catch when a promise gets rejected
// .then when a promise gets resolved
// each chained promise gets the results of its predecessor
// db.execute("SELECT * FROM products")
//   .then((result) => {
//     console.log(result[0], result[1]);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

if (CURRENT_VIEW_ENGINE === "hbs") {
  // ------------------------ SET HANDLEBARS ----------------------------
  // init handlebars view engine + some configuration
  app.engine(
    "hbs",
    handlebars({
      layoutsDir: "views/hbs/layouts/",
      defaultLayout: "main-layout",
      // only apply for main layout
      extname: "hbs",
    })
  );

  // pug built-in express upport => auto register with express
  // after slash which view engine we want to use
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// REGISTER A NEW MIDDLEWARE -> STORE THAT USER IN REQUEST to use it anywhere in app
// EXECUTED FOR INCOMING REQUEST -> so only after the initialization code below / so we are guaranteed to fetch in the database
// after a user
app.use((req, res, next) => {
  // // ! ---------------------------- USING MYSQL ------------------------
  // // * ---------------------------- USING MONGODB ------------------------

  // // string will be converted to ObjectId
  // User.findById("624ae4e175f617d9a6474cac")
  //   .then((user) => {
  //     // user will be just all the specified properties/ data from the database
  //     // * NO Access to our Class Methods of User unless...
  //     // extended version - all util methods are available on incoming requests by the 'dummy' user
  //     req.user = new User(user.username, user.email, user.cart, user._id);
  //     // continue with next step middleware
  //     next();
  //   })
  //   .catch((err) => console.log(err));
  next();
});

// use route filtering
app.use("/admin", adminRoutes);
app.use("/", shopRoutes);

// for all http methods get/post
app.use("/", errorsController.get404);

// * ---------------------------- USING MONGODB ------------------------
// callback in the connect function
mongooseConnect(() => {
  app.listen(3000);
});

// ! ---------------------------- USING MYSQL ------------------------

// // ! ----------------------------- THIS IS WAS NPM STARTS RUN ----------------------
// // -------- WITH THE TWO MODELS RELATED, RELATE THEM --------
// // talking about a user created the Product = child of User
// /**
//  * onDelete -> what should happen to any connected products, if a user is deleted?
//  *  => cascade = remove also
//  * * constraints: true simply enforces the rule that the userId foreign key in the Products table must reference a key from the Users table and no other table.
//  * * belongsTo => user Table primary key is the foreign key in the product table
//  */
// // --------------------- ADMIN USER & PRODUCT -------------
// // * A user creates a product
// Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
// // Define the inverse (umgekehrt) and say taht one user has many products because
// // ! one user can add/create more than one product to the shop could replace belongsTo but call both directions to really make
// // ! clear how this relation works.
// // * Same User can create multiple products
// User.hasMany(Product);
// // ------------------- USER & CART --------------
// User.hasOne(Cart);
// // inverse (umgekehrt) = optional ... } add the primary key of User in the Cart
// Cart.belongsTo(User);
// // * MANY TO MANY RELATIONSHIP: One Cart can belongs to many products
// // * But a Product can belongs to many Carts;
// // ! THIS ONLY WORKS with an intermediate table that connects them bascially stores a combination of productIds and Cart IDs
// // TELL sequelize where these connection should be stotred and that is my cart-Item model
// Cart.belongsToMany(Product, { through: CartItem });
// Product.belongsToMany(Cart, { through: CartItem });
// // ------------------- USER & ORDER --------------
// // * order is like child of User, so in Order --> userId
// Order.belongsTo(User);
// // one to many relationship
// User.hasMany(Order);
// // --- many to many
// // the intermediary table connects one order with a product one at a time
// // * so many products gets associated to one Order
// Order.belongsToMany(Product, { through: OrderItem });
// // * so many orders gets associated with one Product
// Product.belongsToMany(Order, { through: OrderItem });

// // has a look at all the models you defined on the sequilize object } creates tables for them
// // IT SYNCS MODELS TO THE DATABASE by creating the appropriate tables. } only create TABLE IF NOT EXISTS
// sequilize
//   // overwrite database in development to reflect new changes = drop all exisiting tables and create new ones
//   // * sync will also define the realations in our db as we define them.
//   // .sync({ force: true })
//   .sync()
//   .then((result) => {
//     // create user manually
//     return User.findByPk(1);
//     // console.log(result);
//   })
//   // if no user than user is null
//   // ! THIS ANONYMOUS FUNCTION WILL RETURN THE SAME - PROMISE FROM USER.CREATE & PROMISE.RESOLVE (else only js object)
//   // ! WE need to be consistent in order to chain .then successfully
//   .then((user) => {
//     if (!user) {
//       return User.create({
//         name: "Martin",
//         email: "Martin@gmail.com",
//       });
//     }
//     // ! immediately resolve to user / could be omitted because return value in a then block it automatically wrapped
//     // into a new promise } pass next .then block new argument
//     return Promise.resolve(user);
//   })
//   .then((user) => {
//     // console.log(user);
//     // * ------------ CREATE NEW CART FOR USER -----------
//     // return user.createCart();
//     return Promise.resolve();
//   })
//   .then((cart) => {
//     app.listen(3000);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

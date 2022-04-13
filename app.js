const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const handlebars = require("express-handlebars");
const mongoose = require("mongoose");
// session middleware
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

// IMPORT ROUTES
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

// IMPORT CONTROLLERS
const errorsController = require("./controllers/errors");

// * ---------------------------- USING MONGODB ------------------------
const mongooseConnect = require("./util/database").mongooseConnect;
const User = require("./models/MongoDB/user");

// MONGO DATABASE CREDENTIALS
const { MONGO_DATABASE_PASSWORD, MONGO_DATABASE_USERNAME } = process.env;
const MONGO_URI = `mongodb+srv://${MONGO_DATABASE_USERNAME}:${MONGO_DATABASE_PASSWORD}@cluster0.pqvdc.mongodb.net/shop?retryWrites=true&w=majority`;

// ! ---------------------------- USING MYSQL ------------------------
// const sequilize = require("./util/database");
// const Product = require("./models/product");
// const User = require("./models/user");
// const Cart = require("./models/cart");
// const CartItem = require("./models/cart-item");

// const Order = require("./models/order");
// const OrderItem = require("./models/order-item");

const app = express();

// * INITIALIZE NEW MONGO DB STREO FOR SESSIONS / use same database: shop
const sessionStore = new MongoDBStore({
  // URI - connection string / which database sever to store data
  uri: MONGO_URI,
  collection: "sessions",
  // when sessions should be expired and cleaned up by mongodb auto.
});

// --------------------- APPLICATION CONFIGURATION ---------------------
const VIEW_ENGINE = ["pug", "hbs", "ejs"];
const CURRENT_VIEW_ENGINE = VIEW_ENGINE[2];

/* GLOBAL CONFIGURATION - SET VIEW ENGINE 
  VALUE on Express application (keys, config items) -> can be accessed with app.get();
  * reserved keys --> views (dir to dynamic views - default = /views) & views engine -> tell express for any dynnmaic templates trying to render
  and there will be a special function for doing that (please use what is specified by us)
*/
app.set("view engine", CURRENT_VIEW_ENGINE);
app.set("views", `views/${CURRENT_VIEW_ENGINE}`);

// MySQL
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

// TODO: IF USE HANDLEBARS AS VIEW ENGINE UNCOMMENT THAT BLOCK
// if (CURRENT_VIEW_ENGINE === "hbs") {
//   // ------------------------ SET HANDLEBARS ----------------------------
//   // init handlebars view engine + some configuration
//   app.engine(
//     "hbs",
//     handlebars({
//       layoutsDir: "views/hbs/layouts/",
//       defaultLayout: "main-layout",
//       // only apply for main layout
//       extname: "hbs",
//     })
//   );

//   // pug built-in express upport => auto register with express
//   // after slash which view engine we want to use
// }

// -------------- REGISTER MIDDLEWARE FOR EACH INCOMING REQUEST ---------------
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

/* SESSION CONFIGRUATION - ARGS
 * >secret: used for signing the HASH which secretly stores our ID in the cookie / key for encrypting cookies
 * >resafe: session will not be saved on every request that is done, so on every response that is sent
 *  but only if something changed in the session => improve perfomance
 * >saveUnitialized: no session gets saved for a request where it doesn't need to be saved because nothing was changed about it
 * >cookie: configuration for session cookie like Max-Age; Http-Only; Expires
 * 
  ADVANTAGE: => each request brings a cookie => this cookie identifies a session (parsed by session middleware) => collectionData in req.session 
  thus: now the user is available for every (accross) request object from the same window / tab -> which identifies a particular session by the session id
 */

app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
  })
);

//  ! req.user will survive cross request because the userId is stored in the sessionStore
// it will have session data loaded / if no session was found session object by default
app.use((req, res, next) => {
  // if we have an active session
  if (req.session.user) {
    /* 
      * req.user : req object property 
      NEED mongoose model methods to work with the document
      STORE THAT USER IN REQUEST to use it anywhere in app
    */
    User.findById(req.session.user._id)
      .then((user) => {
        // now mongoose model / instance of it
        req.user = user;
        next();
      })
      .catch((err) => console.log(err));
  } else {
    // next middleware / routes
    return next();
  }
});

// ! --------------- A USER SHOULD BE NOT SAVED FOR EVERY INCOMING REQUEST INSTEAD USE SESSIONS -------------
// // * THIS RUNS FOR EVERY REQUEST THAT IS WHY WE CAN ACCESS req.user later in a router handler
// // * because it is the same request object
// app.use((req, res, next) => {
//   // ! ---------------------------- USING MYSQL ------------------------
//   // * ---------------------------- USING MONGODB ------------------------
//   // * ---------------------------- USING MONGOOSE ------------------------

//   // string will be converted to ObjectId
//   User.findById("624ca68fd700ae82bb39b758")
//     //  full mongoose model - call its methods
//     .then((user) => {
//       // user will be just all the specified properties/ data from the database
//       // * NO Access to our Class Methods of User unless...
//       // extended version - all util methods are available on incoming requests by the 'dummy' user
//       // * got methods like save(), populate(), select() ;
//       req.user = user;
//       // continue with next step middleware
//       next();
//     })
//     .catch((err) => console.log(err));
// });

// ------------------ ROUTE FILTERING ---------------
app.use("/admin", adminRoutes);
app.use("/", shopRoutes);

// every request will go there when it is not found in the shop Routes
app.use("/", authRoutes);

// for all http methods get/post
app.use("/", errorsController.get404);

// * ---------------------------- USING MONGODB ------------------------
// ONLY START WEBSERVER IF DATABASE CONNECTION IS CREATED
mongooseConnect(() => {
  // ! WE'VE NOW REAL USER SIGNUP FLOW - DONT NEED TO CREATE USER MANUALLY
  // // * check if user already exists
  // // with no args = find the 1st document
  // User.findOne().then((user) => {
  //   if (!user) {
  //     // create a new User
  //     const user = new User({
  //       name: "Martin",
  //       email: "Martin@gmail.com",
  //       cart: {
  //         items: [],
  //       },
  //     });
  //     user.save();
  //   }
  // });
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

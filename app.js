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
const User = require("./models/user");

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
/* GLOBAL CONFIGURATION - SET VIEW ENGINE 
  VALUE on Express application (keys, config items) -> can be accessed with app.get();
  * reserved keys --> views (dir to dynamic views - default = /views) & views engine -> tell express for any dynnmaic templates trying to render
  and there will be a special function for doing that (please use what is specified by us)
*/
app.set("view engine", "ejs");
app.set("views", `views`);

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

// ! ---------------------------- MONGODB NATIVE DRIVER ------------------------
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

const path = require("path");
const cors = require("cors");

const express = require("express");
const bodyParser = require("body-parser");
const handlebars = require("express-handlebars");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");

// IMPORT ROUTES
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

// IMPORT CONTROLLERS
const errorsController = require("./controllers/errors");

// CUSTOM MIDDLEWARE
const haveActiveSession = require("./middleware/have-activeSession");

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

// * INITIALIZE NEW MONGO DB STORE FOR SESSIONS / use same database: shop
const sessionStore = new MongoDBStore({
  // URI - connection string / which database sever to store data
  uri: MONGO_URI,
  collection: "sessions",
  // when sessions should be expired and cleaned up by mongodb auto.
});

// --------------------- APPLICATION CONFIGURATION ---------------------
// // enabled for all origins
// app.use(
//   cors({
//     origin: "http:192.168.2.122:4000",
//   })
// );

// * DOC: Regular Middleware Global Configuration
app.set("view engine", "ejs");
app.set("views", `views`);

// -------------- REGISTER MIDDLEWARE FOR EACH INCOMING REQUEST ---------------
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// * DOC: Regular Middleware Local Authentication: express-session
// ! csrfProtection wil use the session (save the secret)
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
  })
);

// * Generally enabled
// INITIALIZE CSURF
/* Args: 
  secret: Used for assigning token / hashing 
  ! cookie: Boolean = store secret in cookie or in session (default)
  return: Middleware 
*/
app.use(csrf());

// * DOC: Custom Middleware Global Session: haveActiveAuthentication
app.use(haveActiveSession);

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

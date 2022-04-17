const path = require("path");
const cors = require("cors");

const express = require("express");
const handlebars = require("express-handlebars");
const session = require("express-session");
const mongoose = require("mongoose");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const bodyParser = require("body-parser");

// IMPORT ROUTES
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

// IMPORT CONTROLLERS
const errorsController = require("./controllers/errors");

// CUSTOM MIDDLEWARE
const haveActiveSession = require("./middleware/have-activeSession");
const setLocals = require("./middleware/set-locals");
const multerMiddleware = require("./middleware/multerConfig");

// * ---------------------------- USING MONGODB ------------------------
const mongooseConnect = require("./util/database").mongooseConnect;
const User = require("./models/user");
const multerConfig = require("./middleware/multerConfig");

// MONGO DATABASE CREDENTIALS
const { MONGO_DATABASE_PASSWORD, MONGO_DATABASE_USERNAME } = process.env;
const MONGO_URI = `mongodb+srv://${MONGO_DATABASE_USERNAME}:${MONGO_DATABASE_PASSWORD}@cluster0.pqvdc.mongodb.net/shop?retryWrites=true&w=majority`;

const app = express();

// * INITIALIZE NEW MONGO DB STORE FOR SESSIONS / use same database: shop
const sessionStore = new MongoDBStore({
  // URI - connection string / which database sever to store data
  uri: MONGO_URI,
  collection: "sessions",
  // when sessions should be expired and cleaned up by mongodb auto.
});

// TODO: CORS Configuration
// ------------ GLBOAL CONFIGURATION ----------------
// * DOC: Regular Middleware Global Configuration: template / view engine(ejs)
app.set("view engine", "ejs");
app.set("views", `views`);

// -------------- REGISTER MIDDLEWARE FOR EACH INCOMING REQUEST ---------------
// * Request parser
app.use(bodyParser.urlencoded({ extended: false }));
// * DOC: Regular Middleware Global ParsingFiles: multer
app.use(multerConfig);

// ------------ LOOK IF THE REQUEST IS POINTED TO A STATIC RESSOURCE -----------
// * Serve static files (public folder)
app.use(express.static(path.join(__dirname, "public")));

// serve the images if the request goes to /images
app.use("/images", express.static(path.join(__dirname, "images")));

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

// * DOCS: Regular Middleware Global Csrf_Protection: csurf
app.use(csrf());

// * DOCS: Regular Middleware Global USER_FEEDBACK: connect-flash
app.use(flash());

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

// ------------ SET LOCAL VARIABLES THAT ARE PASSED INTO THE VIEWS -----------
// For very request that is executed, these two fields will be set for the views that are rednered
app.use(setLocals);

// ------------------ ROUTE FILTERING ---------------
// Only loggedIn user
app.use("/admin", adminRoutes);

// Everything related for (not) loggedIn User
app.use("/", shopRoutes);

//  Everything related to signUp, signOut
app.use("/", authRoutes);

app.get("/500", errorsController.get500);
// for all http methods get/post
app.use("/", errorsController.get404);

// * ---------SPECIAL TYPE OF MIDDLEWARE - ERROR HANDLING MIDDLEWARE WITH 4 ARGUMENTS--------
// All in-between middelware in controller will be skipped to this middleware
app.use((error, req, res, next) => {
  // we could use the error.httpStatusCode to render another page it
  // and pass it the error code
  switch (error.httpStatusCode) {
    case 500:
      // TO AVOID INFINITE ERROR LOOP
      return res.status(500).render("500", {
        pageTitle: "Error Page",
        path: "/500",
      });
  }
});
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

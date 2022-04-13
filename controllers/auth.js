// =============== CONTROLLER FOR "/ route" ===========

const User = require("../models/user");

// -------------- LOGIN & LOGOUT FLOW  -----------------
exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: req.session.isLoggedIn,
  });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;
  /* SAVING USER/ User related Data IN REQUEST OBJECT: not good practice = not persistent } req.isLoggedIn
    ! After redirection => brand new request even if from same ip address
    Working with unrelated requests, thus unrelated Users! Otherwise they could look into data that they shouldn't see
  */

  // set header - reserved name / exist more: Content-Type
  // res.setHeader("Set-Cookie", [
  //   "isLoggedIn=true; Max-Age=10;",
  //   "name=martin; HttpOnly;",
  // ]);

  // * LOG THE GIVEN USER IN & SAVE ITS DATA IN THE REQ.SESSION
  // string will be converted to ObjectId
  User.findById("6256cf79ffd232c0d6059c12")
    //  user = INSTANCE OF the User Model
    .then((user) => {
      /* STORE USER IN THE SESSION STORE / COLLECTION - CREATE AS SESSION
       * ADD the data we want to save in the store about the USER
       */
      req.session.isLoggedIn = true;
      req.session.user = user;

      // writing to a database like mongodb can take couple of miliseconds to avoid this use .save()
      // to be sure that the session was created before you continue
      req.session.save((err) => {
        if (err) {
          console.log(err);
        }
        res.redirect("/");
      });
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  /* DESTROYING THE SESSION
  * deleting the session from the session store 
  * deleting the data in the req.session object
  ? delete the cookie from the user browser 
  */
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
    res.redirect("/");
  });
};

// -------------- SIGNUP FLOW -----------------
exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Singup",
    isAuthenticated: false,
  });
};
exports.postSignup = (req, res, next) => {
  // --------------- AUTHENTICATION FLOW ----------------

  // Store new User into database
  // TODO: ADD VALIDATION
  const { email, password, confirmPassword } = req.body;

  /* SAVING USER INTO User collection 
    find out if a user with this email address already exists
    Options: 
      1. create an index in the mongo database for email field => give that index the unique property
      2. Look in the collection is user with same id exists } filter 
  */

  //
  User.findOne({ email: email })
    // userDocument
    .then((userDoc) => {
      if (userDoc) {
        // USER FOUND = not creating a new one
        return res.redirect("/signup");
      }
      // User does not exist = create a new one
      const user = new User({
        email,
        password,
        cart: { items: [] },
      });
      return user.save();
    })
    .then((result) => {
      res.redirect("/login");
    })
    .catch((err) => console.log(err));
};

// =============== CONTROLLER FOR "/ route" ===========
// * USE BCRYPT TO HASH / ENCRYPT PASSWORD
const bcrypt = require("bcryptjs");
const { json } = require("express/lib/response");

const User = require("../models/user");

// -------------- LOGIN & LOGOUT FLOW  -----------------
exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: req.session.isLoggedIn,
  });
};

// -------------- Signin / Login FLOW -----------------
exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;
  /* SAVING USER/ User related Data IN REQUEST OBJECT: not good practice = not persistent } req.isLoggedIn
    ! After redirection => brand new request even if from same ip address
    Working with unrelated requests, thus unrelated Users! Otherwise they could look into data that they shouldn't see
  */

  // * setting a cookie manually
  // set header - reserved name / exist more: Content-Type
  // res.setHeader("Set-Cookie", [
  //   "isLoggedIn=true; Max-Age=10;",
  //   "name=martin; HttpOnly;",
  // ]);

  // * LOG THE GIVEN USER IN & SAVE ITS DATA IN THE REQ.SESSION
  User.findOne({ email: email })
    //  user = INSTANCE OF the User Model
    .then((user) => {
      if (!user) {
        // Login failed/ User does not exist
        console.log("User does not exist ");
        return res.redirect("/login");
      }
      /* VALIDATING USER PASSWORD
       * HashOf(enteredPw) == Hash in the database of the given user
       */

      // * First argument will be hashed with the same salt, algorithm, cost => and check if they both match
      bcrypt
        .compare(password, user.password)
        .then((doPasswordMatch) => {
          // ! IF USER ENTERED CORRECT PASSWORD
          if (doPasswordMatch) {
            /* STORE USER IN THE SESSION STORE / COLLECTION - CREATE AS SESSION
             * ADD the data we want to save in the store about the USER
             */
            req.session.isLoggedIn = true;
            req.session.user = user;

            // writing to a database like mongodb can take couple of miliseconds to avoid this use .save()
            // to be sure that the session was created before you continue

            // * .save(callback) => callback will be executed asynchronously / when the saving process id done } different function
            return req.session.save((err) => {
              if (err) {
                console.log(err);
              }
              res.redirect("/");
            });
          }
          // ! IF USER ENTERED WRONG PASSWORD
          res.redirect("/login");
        })
        // ! catch error in the dcypt.compare process
        .catch((err) => {
          console.log(err);
          res.redirect("/login");
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
// * Signup ≠ Signin (Login)} active session | enter application as authenticated user
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
  User.findOne({ email: email })
    // userDocument
    .then((userDoc) => {
      // USER FOUND = not creating a new one
      if (userDoc) return res.redirect("/signup");
      /* bcrypt.has(string, salt value)
       * salt => public unique piece of data
       * salt rounds => cost 2
       */
      // USER DOES NOT EXIST - create encrypted its password 2 ** cost
      /* fix Error: with undefined hashedPassword
      Lecture 256 in Udemy course
      ! if return res.redirect it is possible that the .then method gets called
      ! so that the hashedPassword is undefined => cause error } even if we redirect and thus end req lifetime
      */
      // only hash password if we reach to this point } this code ≠ promise
      return bcrypt.hash(password, 12).then((hashedPassword) => {
        // User does not exist = create a new one
        const user = new User({
          email,
          password: hashedPassword,
          cart: { items: [] },
        });
        return user.save();
      });
    })

    .then((savedUser) => {
      if (savedUser) res.redirect("/login");
    })
    .catch((err) => console.log(err));
};

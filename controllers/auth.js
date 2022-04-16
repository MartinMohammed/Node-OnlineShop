// =============== CONTROLLER FOR "/ route" ===========
// * USE BCRYPT TO HASH / ENCRYPT PASSWORD
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const crypto = require("crypto");
require("dotenv").config();

// * validationResult => allows us to gather all the error of prior validation middleware like isEmail()
// * it will save the error in the req object
const { validationResult } = require("express-validator/check");

// IMPORT CONFIDENTIAL KEYS / VALUES
const { SENDGRID_API_KEY } = process.env;

// ----------------- INITIALIZE A EMAIL  TRANSPORTER -----------------
const FROM_EMAIL = "emailfortesting91@gmail.com";

// * setup telling how e-mails will be delivered
// sendgridTransport will return a configuration that nodemailer can use to use to sendgrid email server
const transporter = nodemailer.createTransport(
  // also username & api key would work
  sendgridTransport({
    auth: {
      api_key: SENDGRID_API_KEY,
    },
  })
);

const User = require("../models/user");

// -------------- SIGNUP FLOW -----------------
exports.getSignup = (req, res, next) => {
  // * For documentation look getLogin about req.flash()
  let message = req.flash("error");
  message = message.length > 0 ? message[0] : null;
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Singup",
    errorMessage: message,
    // First Render = No previous Input
    oldInput: {
      email: "",
      password: "",
    },
    // First Render = No previous Errors
    validationErrors: [],
  });
};
// * Signup ≠ Signin (Login)} active session | enter application as authenticated user
exports.postSignup = (req, res, next) => {
  // --------------- AUTHENTICATION FLOW ----------------
  // Store new User into database
  const { email, password, confirmPassword } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // 422 as common status code to indicate => validation failed | still send response
    // render same page again
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Singup",
      errorMessage: errors.array()[0].msg,
      // IMPROVE UX; KEEP OLD INPUT
      oldInput: {
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      },
      // * For dynamical styling : show user which fields are unvalid
      validationErrors: errors.array(),
    });
  }

  /* SAVING USER INTO User collection 
    find out if a user with this email address already exists
    Options: 
      1. create an index in the mongo database for email field => give that index the unique property
      2. Look in the collection is user with same id exists } filter 
  */

  /* bcrypt.hash(string, salt value)
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
  return bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      // User does not exist = create a new one
      const user = new User({
        email,
        password: hashedPassword,
        cart: { items: [] },
      });
      return user.save();
    })
    .then((savedUser) => {
      // * SUCCESSFULLY SIGNED USER IN
      if (savedUser) {
        res.redirect("/login");

        // --------------- SEND USER AN EMAIL ----------
        // This will return an promise an make an asynchronous request
        // * but we do not depend on it so we can immediately redirect.
        return transporter
          .sendMail({
            // to the registered user, to send multiple to persons use an array
            to: email,
            // must be from a authenticated sender identity
            from: FROM_EMAIL,
            subject: "Signup succeeded.",
            // email content
            html: "<h1>You successfully signed up!</h1>",
          })
          .then((result) => {
            console.log("Email was sent successful %s", result);
          })
          .catch((err) => {
            console.log(
              "There was an error during sending email to registrator",
              err
            );
          });
      }
    })
    .catch((err) => {
      const error = new Error(e);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// -------------- LOGIN & LOGOUT FLOW  -----------------
exports.getLogin = (req, res, next) => {
  // req.flash("error") returns an array of values
  let message = req.flash("error");
  // only the first message if multiple
  // no error messages available if there is no

  message = message.length > 0 ? message[0] : null;
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message,

    // First Render = No previous Input
    oldInput: {
      email: "",
      password: "",
    },
    // First Render = No previous Errors
    validationErrors: [],
  });
};

// -------------- Signin / Login FLOW -----------------
exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "login",
      errorMessage: errors.array()[0].msg,
      // IMPROVE UX; KEEP OLD INPUT
      oldInput: {
        email: email,
        password: password,
      },

      validationErrors: errors.array(),
    });
  }

  /* SAVING USER/ User related Data IN REQUEST OBJECT: not good practice = not persistent } req.isLoggedIn
    ! After redirection => brand new request even if from same ip address
    Working with unrelated requests, thus unrelated Users! Otherwise they could look into data that they shouldn't see
  */

  // * LOG THE GIVEN USER IN & SAVE ITS DATA IN THE REQ.SESSION
  User.findOne({ email: email })
    //  user = INSTANCE OF the User Model
    .then((user) => {
      if (!user) {
        // ! LOGIN FAILS / USER DOES NOT EXIST WITH THE GIVEN EMAIL
        return res.status(422).render("auth/login", {
          path: "/login",
          pageTitle: "login",
          errorMessage: "No user found with that email",
          // IMPROVE UX; KEEP OLD INPUT
          oldInput: {
            email: email,
            password: password,
          },
          // Actually only the email failed but we want deceive (täuschen)
          validationErrors: [
            {
              param: "email",
            },
            {
              param: "password",
            },
          ],
        });
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
          // ! LOGIN FAILES / USER DOES NOT EXIST WITH THE GIVEN EMAIL
          return res.status(422).render("auth/login", {
            path: "/login",
            pageTitle: "login",
            errorMessage: "Invalid email or password",
            // IMPROVE UX; KEEP OLD INPUT
            oldInput: {
              email: email,
              password: password,
            },
            // Actually only the email failed but we want deceive (täuschen)
            // * For dynamical styling : show user which fields are unvalid
            validationErrors: [{ param: "email", param: "password" }],
          });
        })
        // ! catch error in the dcypt.compare process
        .catch((err) => {
          console.log(err);
          res.redirect("/login");
        });
    })
    .catch((err) => {
      const error = new Error(e);
      error.httpStatusCode = 500;
      return next(error);
    });
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

// ------------------------ RESETTING PASSWORDS ---------------------------
// ENTER EMAIL for which password should be resetd
exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  message = message.length > 0 ? message[0] : null;

  res.render("auth/reset", {
    path: "/",
    pageTitle: "Reset Password",
    errorMessage: message,
  });
};

// * Send to email reset link if email exists
exports.postReset = (req, res, next) => {
  const { email } = req.body;

  // Buffer => waiting Area : deliver data in chunks => bus station
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    // valid buffer / convert buffer in hex format to ASCII
    const token = buffer.toString("hex");
    // find User in database to assign him the unique token
    User.findOne({ email: email })
      .then((user) => {
        if (!user) {
          req.flash("error", "No account with that email found.");
          return res.redirect("/reset");
        }
        // Modify the user mongoose document to save it updated back
        user.resetToken = token;
        // one hour 60 * (1minute = 1000 * 60)
        user.resetTokenExpiration = Date.now() + 36000000;
        return user.save();
      })
      .then((result) => {
        // if user was saved successfully it returns the saved data | prevent set headers
        // after they are sent to the client
        if (result) {
          res.redirect("/");
          // ----------- send token reset mail -------------
          return transporter
            .sendMail({
              to: email,
              from: FROM_EMAIL,
              subject: "Reset your password",
              // ! The token is what we'll look for later to confirm that this link was sent by us
              // ! because we know the token
              html: `
            <p> You requested a password reset</p>
            <p>Click this <a href="http://192.168.2.122:3000/reset/${token}">link</a> to set a new password.</p>
            `,
            })
            .then((result) => {
              console.log("Email status: ", result);
            });
        }
      })
      .catch((err) => {
        const error = new Error(e);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

//* Render the page where the user actually can update its password
exports.getNewPassword = (req, res, next) => {
  const { token } = req.params;
  // ! FIND USER WITH THAT TOKEN & TokenExpiration is greateer than date.now } = valid
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      // ! NO USER WAS FOUND WITH THAT TOKEN
      // * token either expired / faked
      if (!user) {
        req.flash("error", "No user was found with that reset token.");
        return res.redirect("/reset");
      }
      // ! USER WAS FOUND WITH THAT TOKEN
      let message = req.flash("error");
      message = message.length > 0 ? message[0] : null;

      return res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "New Password",
        errorMessage: message,
        // * Include it in the post request => update the password (identify from which user)
        userId: user._id.toString(),

        // ! need the token in order to prevent other users making post requests to change passwords
        passwordToken: token,
      });
    })
    .catch((err) => {
      const error = new Error(e);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postNewPassword = (req, res, next) => {
  // userId type String
  const { userId, password: newPassword, passwordToken } = req.body;
  // Extends its scope
  let resetUser;

  // three AND filter criterias => makes harder to change passwords with random guessing
  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      if (!user) {
        req.flash("error", "Cannot reset password for unregistered User.");
        return res.redirect("/reset");
      }
      console.log(user);
      // USER WAS FOUND
      resetUser = user;

      // HASH THE NEW PASSWORD with cost**12
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      if (hashedPassword) {
        resetUser.password = hashedPassword;

        // Unset the arguments for reseting the password
        resetUser.resetToken = undefined;
        resetUser.resetTokenExpiration = undefined;
        return resetUser.save();
      }
    })
    .then((result) => {
      if (result) {
        // * SUCCESSFULY RESETTED THE PASSWORD OF THE USER
        res.redirect("/login");
        return transporter.sendMail({
          to: resetUser.email,
          from: FROM_EMAIL,
          subject: "Successful changed your password.",
          html: `
          You changed your password.
          `,
        });
      }
    })
    .then((emailStatus) => {
      console.log(emailStatus);
    })
    .catch((err) => {
      const error = new Error(e);
      error.httpStatusCode = 500;
      return next(error);
    });
};

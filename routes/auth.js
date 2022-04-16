// ------------ MANAGE AUTHENTICATION RELATED STUFF  -----------
const express = require("express");
// check function from the sub-package / object
const { check, body } = require("express-validator/check");

const authController = require("./../controllers/auth");
const User = require("../models/user");
const { emailValidatorSignIn } = require("../validators/auth");

const router = express.Router();

// -------------- SIGNUP ------------
router.get("/signup", authController.getSignup);
router.post(
  "/signup",
  // ! Middleware chain
  [
    // * An optional object: Extract location to which this was sent, the path or the request object.
    body(["email"])
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom(emailValidatorSignIn)
      // only normalize when the email is valid
      .normalizeEmail(),
    body(
      "password",
      "Please enter a password with only numbers and text and at least 5 characters."
    )
      .isLength({
        min: 5,
        max: 30,
      })
      .isAlphanumeric()
      // if password contains whitespaces => invalid password but still
      // trim the whitespaces out
      .trim(),
    body("confirmPassword")
      // if firstInput password = whitespace * 5
      // secondInput all whitespace will be trimmed and then compared: invalid
      .trim()
      .custom((value, { req }) => {
        if (req.body.password !== value) {
          throw new Error("Password have to match!");
        }
        return true;
      }),
  ],
  authController.postSignup
);

// ------------- LOGIN & LOGOUT -----------
router.get("/login", authController.getLogin);
router.post(
  "/login",
  [
    body(["email"], "error")
      .isEmail()
      .withMessage("Please enter a vaild email.")
      .normalizeEmail(),
    body(
      ["password"],
      "Please enter a password with only numbers and text and at least 5 characters."
    )
      .isLength({
        min: 5,
        max: 30,
      })
      .isAlphanumeric()
      .trim(),
  ],
  authController.postLogin
);
router.post("/logout", authController.postLogout);

// ------------- RESETTING PASSWORD -----------
//* FIND USER FROM WHICH PASSWORD SHOULD BE CHANGED - EMAIL
router.get("/reset", authController.getReset);
router.post("/reset", authController.postReset);

//* ACTUAL UPDATE OF PASSWORD
// routing parameter
router.get("/reset/:token", authController.getNewPassword);
router.post("/new-password", authController.postNewPassword);

module.exports = router;

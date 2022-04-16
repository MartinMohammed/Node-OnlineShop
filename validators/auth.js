const User = require("../models/user");

// --------------- CUSTOM VALIDATORS FOR AUTHENTICATION -------------
//* FOR EMAIL in signUp (registration) process
exports.emailValidatorSignIn = (email, { req }) => {
  // * –------------- VALIDATE USER EMAIL CHECK IF THE USER EXISTS IN THE DATABASE ------------
  /* RETURN MAIN CHAIN PROMISE 
  ! express-validator package will look for custom validator which return either true/ false (throw error) or
  ! a Promise. If the main chain Promise was not rejected: Passed that custom Validation 
  */
  return (
    User.findOne({ email: email })
      // userDocument
      .then((userDoc) => {
        if (userDoc) {
          // ! USER FOUND = not creating a new one
          // * throw an error inside the promise. Could Add catch block
          return Promise.reject(
            "E-Mail exists already, please signUp or pick a different one."
          );
        }
      })
  );
};

const User = require("../models/user");

// ------------- SAVE THE USER IN THE REQUEST OBJECT ----------------
// ! Called in the beginning of the request cycle in app.js
module.exports = (req, res, next) => {
  if (req.session.user) {
    /* ACTIVE SESSION = AUTHENTICATED USER
    if user has an 'active' session => authenticated 
    * the session middleware has parsed his cookie and fetched the session data for the
    * respective user 
    else no active session 
    */
    User.findById(req.session.user._id)
      .then((user) => {
        if (!user) {
          // User was not found in the database
          return next();
        }
        // On req.user => mongoose instance "syntactically sugar"
        req.user = user;
        next();
      })
      .catch((err) => {
        // throw Real Error to handle it
        throw new Error(err);
      });
  } else {
    // next middleware / routes
    req.session.isLoggedIn = false;
    return next();
  }
};

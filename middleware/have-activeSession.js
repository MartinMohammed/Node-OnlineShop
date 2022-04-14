const User = require("../models/user");

module.exports = (req, res, next) => {
  // if we have an active session
  if (req.session.user) {
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
};

// WILL BE INSIDE A ROUTE HANDLER AS REFERENCE = GET req, res, next arguments
module.exports = (req, res, next) => {
  // NOT AUTHENTICATED
  if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  }
  next();
};

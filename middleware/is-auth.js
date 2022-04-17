// WILL BE INSIDE A ROUTE HANDLER AS REFERENCE = GET req, res, next arguments
module.exports = (req, res, next) => {
  // IF USER IS NOT AUTHENTICATED YET
  if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  }
  next();
};

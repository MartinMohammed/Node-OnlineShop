module.exports = (req, res, next) => {
  // For the View fields
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
};

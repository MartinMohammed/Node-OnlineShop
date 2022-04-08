const User = require("../../models/MongoDB/user");

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: req.session.isLoggedIn,
  });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;
  console.log(email, password);
  // ! not good practice : to "/" (redirection) creates a brand new request / even if from same ip address
  // * working with totally seperate requests otherwise if user requests are related to each other
  // * they could look into data that they shouldn't see
  //   req.isLoggedIn = true;

  // set header - reserved name / exist more: Content-Type
  // res.setHeader("Set-Cookie", [
  //   "isLoggedIn=true; Max-Age=10;",
  //   "name=martin; HttpOnly;",
  // ]);

  // string will be converted to ObjectId
  User.findById("624f4943a75868b4e260ee84")
    //  full mongoose model - call its methods
    .then((user) => {
      // store the fetched user is the session collection / store
      // * now the user is available for every (accross) request object from the same window / tab -> which identifies a particular session by the session id
      // * use the session middleware
      // add any key you want

      // writing to a database like mongodb can take couple of miliseconds to avoid this use .save()
      req.session.isLoggedIn = true;
      req.session.user = user;
      // to be sure that the session was created before you continue
      res.session.save((err) => {
        console.log(err);
        res.redirect("/");
      });
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  // req.session will be destroyed => execute callback after destroying it / all the session data
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

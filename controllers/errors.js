// =============== CONTROLLER FOR "/" route ===============
// Server could not find the requested website
exports.get404 = (req, res, next) => {
  // res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
  res.status(404).render(`404`, {
    pageTitle: "Page not found",
    path: "/404",
  });
};

// SEver encountered an unexpected condition that prevented it from fulfilling the request
exports.get500 = (req, res, next) => {
  res.status(500).render("500"),
    {
      pageTitle: "Error Page",
      path: "/404",
    };
};

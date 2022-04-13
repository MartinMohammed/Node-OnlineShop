// =============== CONTROLLER FOR "/ route" ===========

exports.get404 = (req, res, next) => {
  // res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
  res.status(404).render(`404`, {
    pageTitle: "Add Product",
    path: "/404",
    //-------------- FOR HANDLEBARS -------------
    // activeShop: false,
    // activeAddProduct: false,
    // formsCSS: false,
    // productCSS: false,
  });
};

// ----------------- USER PANEL - CONTROLLER ---------------------
// ! ---------------------------- USING MYSQL ------------------------
// capital because it is a class
const Product = require("../../models/MySQL/product");
const Cart = require("../../models/MySQL/cart");

exports.getHomepage = (req, res, next) => {
  /**
   * * findAll can also accept some configuration like 'where' to restrict the data we want to retrieve
   * * if findAll Promise resolved it passes argument to .then method with the products in a given array
   * * each products is contains its dataValues and some additional data like _previousDataValues
   */
  Product.findAll()
    .then((products) => {
      res.render("shop/product-list", {
        // pass  complete object from Product Class - its properties are accessbile
        prods: products,
        pageTitle: "Homepage",
        path: "/",
        // //-------------- FOR HANDLEBARS -------------
        // hasProducts: products.length > 0,
        // activeShop: true,
        // activeAddProduct: true,
      });
    })
    .catch((err) => {
      console.trace("Fetch all Data from Database");
      console.log(err);
    });

  // Product.fetchAll()
  //   .then(([rows, fieldData]) => {
  //     res.render("shop/product-list", {
  //       // pass  complete object from Product Class - its properties are accessbile
  //       prods: rows,
  //       pageTitle: "Products",
  //       path: "/",
  //       // //-------------- FOR HANDLEBARS -------------
  //       // hasProducts: products.length > 0,
  //       // activeShop: true,
  //       // activeAddProduct: true,
  //     });
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
};

exports.getCart = (req, res, next) => {
  // only find the cart which is associated to the current user (find the cart where the current userId is in the cart)
  req.user
    .getCart()
    .then((cart) => {
      // return associatedCart  with user and return all associated products inside the cart
      return cart.getProducts();
    })
    .then((cartProducts) => {
      res.render("shop/cart", {
        pageTitle: "Cart",
        path: "/cart",
        products: cartProducts,
      });
    })
    .catch((err) => console.log(err));

  // --------------- WE MAKE THIS TO BECOME THE PRODUCT DETAILS OF EACH ITEM IN THE CART ----------
  // Cart.getCart((cart) => {
  //   // --------------------- NOT EVERY PRODUCT WE HAVE IS IN THE CART OF THE USER ------------
  //   Product.fetchAll((products) => {
  //     const cartProducts = [];
  //     // if no product is in the cart then our array will remain empty
  //     for (product of products) {
  //       // itereate through every product in the products array of the cart and
  //       //  look if the id of the object matches the id of the product in products.json file
  //       const cartProductData = cart.products.find(
  //         (prod) => prod.id === product.id
  //       );
  //       // if true --> the current product is in the cart
  //       if (cartProductData) {
  //         // joining two data sets together
  //         cartProducts.push({ productData: product, qty: cartProductData.qty });
  //       }
  //     }
  //     res.render("shop/cart", {
  //       pageTitle: "Cart",
  //       path: "/cart",
  //       products: cartProducts,
  //     });
  //   });
  // });
};

exports.postCart = (req, res, next) => {
  const productId = req.body.productId;
  let fetchedCart;
  let newQuantity = 1;
  req.user
    .getCart()
    .then((cart) => {
      // find out if product is already part of the cart : if so increase quantity else add produc to cart
      fetchedCart = cart;
      return cart.getProducts({ where: { id: productId } });
    })
    .then((products) => {
      let product;
      if (products.length > 0) {
        product = products[0];
      }
      if (product) {
        // *  product does exist in the cart

        // get old quantity for this product and increase it
        const oldQuantity = product.cartItem.quantity;
        newQuantity = oldQuantity + 1;
        return Promise.resolve(product);
      }
      // * product is not part of cart yet / so we need product data to store it
      return Product.findByPk(productId);
    })
    // either way it will retrieve an existing(cart) or not existing product (product table )
    .then((product) => {
      // * another magic method added by sequelize for many to many relationships
      // add the Product to this in-between table with its id

      // now with through: here some additional information you need to set the values in there (another object)
      // with the keys which should be set to new quantity

      // it will look in the product if the id is already exisiting in the cartItem table
      // if so update the specific cartItem where the product id matches
      return fetchedCart.addProduct(product, {
        through: { quantity: newQuantity },
      });
    })
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => console.trace(err));

  // Product.findById(productId, (product) => {
  //   Cart.addProduct(productId, product.price);
  // });
  // res.redirect("/cart");
};

exports.postCartDeleteItem = (req, res, next) => {
  const productId = req.body.productId;
  let fetchedCart;
  req.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      return cart.getProducts({ where: { id: productId } });
    })
    .then((products) => {
      let product;
      if (products.length > 0) {
        product = products[0];
      }
      if (product) {
        // product is available in the cart / delete the product only in the intermediate table
        // (as cartItem that connect cart with product)
        // * THIS IS A OPTION
        // ! fetchedCart.removeProduct(product);
        // it will remove the specific product (based on the productId) in the cartItem table
        return product.cartItem.destroy();
      }
    })
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => console.trace(err));
};

exports.getProducts = (req, res, next) => {
  // --- make the function compatible for all three view engines ---
  // --------- fetchAll will try to read the json file asynchronously if data was read it will call an callback
  // in which the given callcack is executed.
  // the passed fetchAll callback will receive the products/data from the file render the shop page

  Product.findAll()
    .then((products) => {
      res.render("shop/product-list", {
        // pass  complete object from Product Class - its properties are accessbile
        prods: products,
        pageTitle: "Products",
        path: "/products",
        // //-------------- FOR HANDLEBARS -------------
        // hasProducts: products.length > 0,
        // activeShop: true,
        // activeAddProduct: true,
      });
    })
    .catch((err) => {
      console.trace("Fetch all Data from Database");
      console.log(err);
    });

  // Product.fetchAll()
  //   .then(([rows, fieldData]) => {
  //     res.render("shop/product-list", {
  //       // pass  complete object from Product Class - its properties are accessbile
  //       prods: rows,
  //       pageTitle: "Products",
  //       path: "/products",
  //       // //-------------- FOR HANDLEBARS -------------
  //       // hasProducts: products.length > 0,
  //       // activeShop: true,
  //       // activeAddProduct: true,
  //     });
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
};

// ---------------- SINGULAR ----------
exports.getProduct = (req, res, next) => {
  // the dynamic segment name (that what is behind the column)
  const prodId = req.params.productId;
  // if no Product was found singleProduct = empty array!!
  // returns single product not in an array
  /**
   * Alternative: findAll({where: {id: prodId}}).then(product => ...)
   */
  Product.findByPk(prodId)
    .then((product) => {
      res.render("shop/product-detail", {
        pageTitle: product.title,
        path: "/products",
        existingDetails: product !== undefined,
        product: product,
      });
    })
    .catch((err) => console.log(err));
};

exports.postOrder = (req, res, next) => {
  let fetchedCart;

  // fetch all user related products from the cart
  req.user
    .getCart()
    .then((cart) => {
      // fetch all products related to the cartId which corresponds to ther userId
      fetchedCart = cart;
      return cart.getProducts();
    })
    .then((products) => {
      // put all the products into a order
      // like we've created a cart for the user now a order
      return req.user.createOrder().then((order) => {
        // associate products to the order
        // array with all the old product data but also this new information regarding
        // the quantity (from cartItem intermediary table) for order
        // and add products will pick this up
        order
          .addProducts(
            products.map((product) => {
              product.orderItem = { quantity: product.cartItem.quantity };
              return product;
            })
          )
          .then((result) => {
            // after the order-item was successfully created the cart
            // should drop all its user associated products } by setting null
            return fetchedCart.setProducts(null);
          })
          .then((result) => res.redirect("/orders"))
          .catch((err) => console.trace(err));
      });
    });
};

exports.getOrders = (req, res, next) => {
  req.user
    // ------------- EAGER LOADING } -----------
    // do have an array of orders but an order does not have an orderItem key (not provided by sequelize)
    // if also want to fetch the related products to the given order pass object
    // products: because Order.belongsToMany (Product) - WORKS BECAUSE WE HAVE RELATION BETWEEN ORDERS AND PRODUCTS
    // ! SO PLEASE SLSO FETCH ALL RELATED PRODUCTS ALREADY AND GIVE ME
    // ! BACK ONE ARRAY OF ORDERS THAT ALSO INCLUDES THE PRODUCTS PER ORDER
    .getOrders({ include: ["products"] })
    .then((orders) => {
      // const order = orders[3];
      // get the related data to the products
      // order.getProducts().then((data) => console.log(data));
      res.render("shop/orders", {
        pageTitle: "Orders",
        path: "/orders",
        orders,
      });
    })
    .catch((err) => console.trace(err));
};

exports.getCheckout = (req, res, next) => {
  res.render("/shop/checkout", {
    pageTitle: "Checkout",
    path: "/checkout",
  });
};

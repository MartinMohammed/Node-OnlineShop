// =============== CONTROLLER FOR "/" route ===============
// Packages
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
// Provide the Private api key
const { STRIPE_PRIVATE_KEY } = process.env;
const stripe = require("stripe")(STRIPE_PRIVATE_KEY);

// Models
const Product = require("../models/product");
const Order = require("../models/order");

// Constants
const ITEMS_PER_PAGE = 2;

exports.getHomepage = (req, res, next) => {
  //*  Get the information which page we are
  //* = which data for which page needs to be displayed

  // IF undefined => fallback
  const page = Number(req.query.page) || 1;
  let totalItems;

  Product.find()
    .count()
    .then((numProducts) => {
      totalItems = numProducts;
      return (
        Product.find()
          // ---------------- DATABASE SIDE -----------------
          // ! returns a cursor - skip the first X amount of results
          //  * On page 1: (1 - 1) * 2 = 0. Return the first two products
          .skip((page - 1) * ITEMS_PER_PAGE)
          // ! limit the amount of data we fetch to the specified number
          .limit(ITEMS_PER_PAGE)
      );
    })
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Homepage",
        path: "/",
        // ------------- PREPERATION PAGINATION DATA ON THE SERVER  ------------
        currentPage: page,
        // e.g. On page 1: 1 * 2 < 3: If true we have still products left to display
        hasNextPage: page * ITEMS_PER_PAGE < totalItems,
        // page 1 is the most starting page

        // Can be avoided: If page > 1 (no minus pages) && page != 2 (previous Page is not starting page)
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        // e.g. have 11 totalItems: 11 / 2 => 6
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => console.log(err));
};

exports.getProducts = (req, res, next) => {
  const page = Number(req.query.page) || 1;

  let totalItems;
  // CONTROL THE AMOUNT OF DATA WE RECEIVE
  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "Products",
        path: "/products",
        currentPage: page,
        // e.g. On page 1: 1 * 2 < 3: If true we have still products left to display
        hasNextPage: page * ITEMS_PER_PAGE < totalItems,
        // page 1 is the most starting page

        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        // e.g. have 11 totalItems: 11 / 2 => 6
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => console.log(err));
};

exports.getProduct = (req, res, next) => {
  // GET SPECIFIC PRODUCT
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",

        existingDetails: product !== undefined,
      });
    })
    .catch((err) => console.log(err));
};

exports.getCart = (req, res, next) => {
  // RETURN THE CART OF THE GIVEN USER
  // * populate the cartItem with its corresponding document (product)
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items;
      res.render("shop/cart", {
        pageTitle: "Cart",
        path: "/cart",
        products,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// ADD PRODUCT TO THE CART
exports.postCart = (req, res, next) => {
  // prodId from hidden input field
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      // *  user from app.js is an instance of the User Model (access to its static / normal methods)
      // return another promise / product is a schema instance
      return req.user.addToCart(product);
    })
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
};

exports.postCartDeleteItem = (req, res, next) => {
  const productId = req.body.productId;
  req.user
    .removeFromCart(productId)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
};

// GET THE ORDERS FROM THE CURRENT ACTIVE USER => SESSION
exports.getOrders = (req, res, next) => {
  // nested fields => path
  Order.find({ "user.userId": req.session.user._id })
    .then((orders) => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders,
      });
    })
    .catch((err) => console.log(err));
};

// ------------------- CHECKOUT ----------------
exports.getCheckout = (req, res, next) => {
  // block scope
  let products;
  let totalSum = 0;
  // * Current logged in user
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      products = user.cart.items;
      // * for every product in the cart:
      // USER MODEL
      products.forEach((product) => {
        totalSum += product.quantity * product.productId.price;
      });
      // ------------ STRIPE SESSION ---------------
      //  ! Our customer will use our public key & we create for them a Stripe Session where they checkout
      /* ! stipeCheckoutSession configuration
        - payment_method_types: allows payment methods such as credit card
        - line_Items: [{name, description, amount(in cents), currency, quantity}] : Product Data stripe needs to make charges (process the payment)
          checkout Items 
        - 
        - success_url & cancel_url:
          * URLS stripe will redirect the user once the transaciton was completed or failed
          * http or https || the ipadress / domain of the host deployed it onto
      */
      return stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: products.map((p) => {
          // ! user.cart.items array of products : productId populated with actual product data
          const { title, description, price } = p.productId;
          return {
            name: title,
            description: description,
            amount: price * 100,
            currency: "usd",
            quantity: p.quantity,
          };
        }),
        success_url: `${req.protocol}://${req.get("host")}/checkout/success`,
        cancel_url: `${req.protocol}://${req.get("host")}/checkout/cancel`,
      });
    })
    .then((session) => {
      res.render("shop/checkout", {
        pageTitle: "Checkout",
        path: "/checkout",
        products,
        totalSum: totalSum,
        sessionId: session.id,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// Create a order after the user went successfully through the paymend process
exports.getCheckoutSuccess = (req, res, next) => {
  req.user
    // * it will populate "cart.items.productId": {product Data such as title...}
    .populate("cart.items.productId")
    .then((user) => {
      // * -------------- IN ACCORDANCE WITH THE ORDER MODEL/ SCHEMA -------------
      // return the according array of products to the order schema
      const products = user.cart.items.map((i) => {
        // * properly object for the order model / mongoose will autoselect _id if no spread operator
        // ! with ._doc just get really access to the data and not to the bunch of metadata
        // * PLEASE REFERENCE TO ORDER MODEL => productitem
        return { quantity: i.quantity, productData: { ...i.productId._doc } };
      });
      const order = new Order({
        // * USERDATA & Products
        user: {
          email: req.user.email,
          userId: req.user,
        },
        // * PRODUCTS ARRAY
        // [{quantity, productData}]
        products: products,
      });
      order.save();
    })
    .then((result) => {
      console.log("successfully placed the order");
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch((err) => next(err));
};

// ------------------- ORDER INVOICES -------------
// * /orders/order._id page refer to this
exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  const loggedInUser = req.session.user;
  // ! AUTHORIZATION - RESTRICTING ACCESS TO INVOICE
  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        // Particular Order as ressource not found = No invoice
        return res.redirect("/orders");
      }

      if (order.user.userId.toString() !== loggedInUser._id.toString()) {
        // Redirect unauthorized access: 403
        return res.redirect("/orders");
      }

      // ----------------- GENERATING .PDF FILES WITH ORDER DATA ---------------
      const invoiceName = `invoice-${orderId}.pdf`;
      const invoicePath = path.join("data", "invoices", invoiceName);

      // ! Generated PDF = readableStream
      const pdfDoc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      // HOW THE FILE SHOULD BE SERVED AND OPENED
      res.setHeader(`Content-Disposition`, `inline; filename="${invoiceName}"`);
      // ------------ WHATEVER WE ADD TO THE DOCUMENT
      //  => FORWARD INTO THE FILE AND STREAMDED IN RESPONSE ----------

      /* Stream = Stream of data that flaws from one place to another 
      writeableFileStream = where chunks come together to create a File
      readableFileStream = where chunks come together from reading a File

      pipe takes the chunks from readable and writes them into writeable 
      * Stream the generated file to our filesystem
      */
      const writeableFileStream = fs.createWriteStream(invoicePath);
      pdfDoc.pipe(writeableFileStream);

      // * takes chunks and write it to response stream
      pdfDoc.pipe(res);

      // add single line into pdf
      pdfDoc.fontSize(26).text("Invoice", {
        underline: true,
      });

      pdfDoc.text("-----------------");
      let totalPrice = 0;
      const { products } = order;

      products.forEach((orderProduct) => {
        // product information
        const { title, price } = orderProduct.productData;
        const { quantity } = orderProduct;

        // A product: Shoe | qty = 4 price * 10 = price = 40
        totalPrice += quantity * price;
        pdfDoc.fontSize(14).text(`${title}-${quantity} x ${price}`);
      });
      pdfDoc.text("-----------------");
      pdfDoc.fontSize(14).text("Total Price: $" + totalPrice);

      // ! TELL NODE
      // * .end() = Done reading - No incoming stream data
      // * Done writing - writeStream = save File
      pdfDoc.end();

      // ! ---------- PRELOADING FILE => READ ENTIRE FILE INTO LIMITED MEMORY ------------
      // // call callback when reading succeeded
      // fs.readFile(invoicePath, (err, data) => {
      //   // data in form of buffer
      //   if (err) {
      //     // default error handling - middleware
      //     return next(err);
      //   }

      //   // * WHAT KIND OF FILE WE SEND
      //   res.setHeader("Content-Type", "application/pdf");
      //   // HOW THE FILE SHOULD BE SERVED AND OPENED
      //   res.setHeader(
      //     `Content-Disposition`,
      //     `inline; filename="${invoiceName}"`
      //   );
      //   // send the data to the user - so he can download it
      //   res.send(data);
      // });
      // ! ---------- STREAMING FILE =>  READ & SEND IN CHUNKS ------------
      // // Step by step in different chunks
      // const file = fs.createReadStream(invoicePath);
      // res.setHeader("Content-Type", "application/pdf");
      // // HOW THE FILE SHOULD BE SERVED AND OPENED
      // res.setHeader(`Content-Disposition`, `inline; filename="${invoiceName}"`);
      // /*  STREAMS
      //   ! Use readable streams to pipe their output out into a writable streams

      //   file.pipe(res)
      //   * forward the data that is read in with that stream
      //   * into the response object = writable stream
      //   *
      //   * The response will be streamed to the browser and will contain the data and the data
      //   * will be downloaded by the borwser step by step
      // */
      // file.pipe(res);
    })
    .catch((err) => {
      // Error while fetching Data from the database
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

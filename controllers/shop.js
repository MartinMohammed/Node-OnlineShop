// =============== CONTROLLER FOR "/ route" ===========
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const Product = require("../models/product");
const Order = require("../models/order");
// const User = require("../models/user");
// const Cart = require(../models/cart")

exports.getHomepage = (req, res, next) => {
  // GET ALL THE PRODUCTS
  Product.find()
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "Homepage",
        path: "/",
      });
    })
    .catch((err) => console.log(err));
};

exports.getProducts = (req, res, next) => {
  // GET ALL THE PRODUCTS
  Product.find()
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
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
    .catch((err) => console.log(err));
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
exports.postOrder = (req, res, next) => {
  req.user
    // * it will populate "cart.items.productId": {productData such as title...}
    // * insert the product (document) where the id field is
    .populate("cart.items.productId")
    .then((user) => {
      // * -------------- IN ACCORDANCE WITH THE ORDER MODEL/ SCHEMA -------------
      // updated cart items now with product data
      // return the according array of products to the order schema
      const products = user.cart.items.map((i) => {
        // * properly object for the order model / mongoose will autoselect _id if no spread operator
        // ! with ._doc just get really access to the data and not to the bunch of metadata

        // * PLEASE REFERENCE TO ORDER MODEL => productitem
        return { quantity: i.quantity, productData: { ...i.productId._doc } };
      });
      const order = new Order({
        // needs to get products/ userData and
        // * USERDATA
        user: {
          email: req.user.email,
          userId: req.user,
        },
        // * PRODUCTS ARRAY
        // [{quantity, productId}]
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

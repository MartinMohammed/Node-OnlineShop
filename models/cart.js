const Sequelize = require("sequelize").Sequelize;

const sequelize = require("../util/database");

// One Cart should belong to a single user but many hold multiple products
// but the cart table should hold the differenct cars which up ...
const Cart = sequelize.define("cart", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
});

module.exports = Cart;

// --------------------- OLD VERSION -----------------
// // ---------- CART ≠ OBJECT THAT WE CONSTANTLY RECREATE -------- >>> UTILITY MODEL
// // -- not for every product we add we want to have a new cart, instead
// //  there always wil be a cart in our application  and we just want to mangage the products in there

// const fs = require("fs");
// const path = require("path");
// const rootDir = require("../util/path");

// const p = path.join(rootDir, "data", "cart.json");

// // ------------------ IN THE CART A PRODUCT INSTANCE HAS QUANTITY AND ID ------------- //
// module.exports = class Cart {
//   // --------- SINGULAR ---------
//   static addProduct(id, productPrice) {
//     //--------------- Fetch the previous cart ---------------
//     fs.readFile(p, (err, fileContent) => {
//       let cart = { products: [], totalPrice: 0 };
//       // if (err || fileContent.toString().length === 0) {
//       //   // if file was not created || file is empty

//       // }
//       if (!err && JSON.parse(fileContent)) {
//         // so file exist and there is some data inside it
//         cart = JSON.parse(fileContent);
//       }
//       // -------------- Analyse the Cart => Find existing product ------------

//       // if file does not exist existingProductIndex = -1, undefined
//       const existingProductIndex = cart.products.findIndex(
//         (product) => product.id === id
//       );
//       const existingProduct = cart.products[existingProductIndex];

//       // ---------------- Add new product/ increase quantity --------------
//       let updatedProduct;
//       // if file exist  and product exist
//       if (existingProduct) {
//         // if product exists already in the cart -> increase quantity
//         // create brand new object with the spread operator / not same memory location
//         updatedProduct = {
//           ...existingProduct,
//         };
//         updatedProduct.qty += 1;
//         cart.products = [...cart.products];
//         cart.products[existingProductIndex] = updatedProduct;
//         // NOW FOR THE PRODUCT IN THE CART THE QUANTITY HAS CHANGED SO WE HAVE TO INSERT THE LOCAL CHANGE (updatedProduct)
//       }
//       // if file does not exist or the product not
//       else {
//         // else if no product exists in the cart, add new product
//         updatedProduct = { id: id, qty: 1 };
//         cart.products = [...cart.products, updatedProduct];
//       }
//       // for each function call only one products gets added into the cart so 1* current product price
//       cart.totalPrice += +productPrice;

//       fs.writeFile(p, JSON.stringify(cart), (err) => {
//         if (err) {
//           console.log(err);
//         }
//       });
//     });
//   }
//   //  -------- DELETES PRODUCT ONLY IN THE CART -----------
//   static deleteProduct(id, productPrice) {
//     fs.readFile(p, (err, fileContent) => {
//       // no cart = there is nothing to delete
//       if (err) {
//         console.log("product was not found in the cart. ");
//         return;
//       } else {
//         // all data from the cart
//         const updatedCart = { ...JSON.parse(fileContent) };
//         // find a product in the cart with the given product id
//         const product = updatedCart.products.find(
//           (product) => product.id === id
//         );
//         // --------------- DECREASING CART TOTAL PRICE ----------
//         // if the product was not found in the cart
//         if (!product) {
//           return;
//         } else {
//           const productQty = product.qty;
//           // the parent keys arent getting changed (products: , totalPrice: )
//           updatedCart.products = updatedCart.products.filter(
//             (product) => product.id !== id
//           );
//           updatedCart.totalPrice =
//             updatedCart.totalPrice - productQty * productPrice;
//           // --------------- REMOVING PRODUCT FROM CART ----------
//           fs.writeFile(p, JSON.stringify(updatedCart), (err) => {
//             if (err) {
//               console.log(err);
//             }
//             console.log(
//               "successfully deleted product in the cart storage: ",
//               id
//             );
//           });
//         }
//       }
//     });
//   }
//   static getCart(cb) {
//     fs.readFile(p, (err, fileContent) => {
//       const cart = JSON.parse(fileContent);
//       if (err) {
//         cb(null);
//       } else {
//         cb(cart);
//       }
//     });
//   }
// };

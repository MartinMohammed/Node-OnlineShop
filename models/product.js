const Sequelize = require("sequelize");

// import database connection pool
const sequelize = require("../util/database");

// ----------- DEFINE A MODEL THAT WILL BE MANAGED BY SEQUILIZE / FULLY CONFIGURED SEQUILIZE ENVIRONMENT ---------
// ------> The same work we did with MySql Workbench to create database

// model name - lowercase } name will be automatically pluralized
const Product = sequelize.define("product", {
  // attributes / fields our product should have
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  title: Sequelize.STRING,
  price: {
    type: Sequelize.DOUBLE,
    allowNull: false,
  },
  imageUrl: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = Product;

// const db = require("../util/database");

// const res = require("express/lib/response");
// // const fs = require("fs");
// // const path = require("path");
// // const rootDir = require("../util/path");
// // const Cart = require("./cart");
// // const p = path.join(rootDir, "data", "products.json");

// // ------- HELPER FUNCTION ------
// const getProductsFromFile = (cb) => {
//   // path to our json file
//   // to store new products, first we have to get existing
//   // to not read everything until in memory we can use readStream...

//   fs.readFile(p, (err, fileContent) => {
//     // if file does not exist or if file content is null
//     if (err || JSON.parse(fileContent).length === 0) {
//       return cb([]);
//     }
//     return cb(JSON.parse(fileContent));
//   });
// };

// // ----------------- REPRESENT SINGLE ENTITY - PRODUCT = CORE DATA ------------

// // ------------------------- MODIFY DATA / REPRESENT THE DATA - SO MANAGE IT ------------------

// // how a product looks like, which fileds it has, does it have an image, a title, that is our core data
// // ---------- DEFINES THE MODEL OF THE OBJECT ------
// module.exports = class Product {
//   // if new products gets instantiated we have no initial id so default value
//   constructor(title, imageUrl, price, description, id = null) {
//     // order is important ------------> SAVED IN ORDER
//     //   property of a class
//     this.title = title;
//     this.imageUrl = imageUrl;
//     this.price = price;
//     this.description = description;
//     this.id = id;
//   }
//   // SAVE FUNCTION FOR ADDING NEW PRODUCTS OR EDITING EXISITING PRODUCTS
//   save() {
//     /*
//     SQL KEYWORD
//     -> WHERE TO INSERT
//     DATBASE TABLE NAME
//     FIELDS WE WANT TO INSERT must match
//     -> WHAT TO INSERT - VALUES
//     USE QUESTION MARKS TO SAFELY INSERT VALUES AND NOT FACE THE ISSUE OF SQL INJECTION
//      pass second argument the values we want to insert (that will be injected instead the question marks)
//       => My SQL package will then safely escape (to ENTITIES) our input values to basically parse it for a hidden sql comamnds
//       // and remove them = extra security layer.
//     */
//     return db.execute(
//       `INSERT INTO products (title, price, imageUrl, description) VALUES (?, ?, ?, ?)`,
//       [this.title, this.price, this.imageUrl, this.description]
//     );

//     // ----------- USE CODE BELOW IF SAVING DATA IN JSON FILE -----------
//     // //   now specify what should happen with the read data
//     // getProductsFromFile((products) => {
//     //   // if the product already exists = it has already an id --> so replace old Product with new Product
//     //   if (this.id) {
//     //     const filteredProductIndex = products.findIndex(
//     //       (prod) => prod.id === this.id
//     //     );
//     //     const updatedProducts = [...products];
//     //     updatedProducts[filteredProductIndex] = this;
//     //     // write the updated product information into the file
//     //     fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {
//     //       if (err) {
//     //         console.log(err);
//     //       }
//     //     });
//     //   } else {
//     //     this.id = Math.random().toString();
//     //     products.push(this);
//     //     // put the existing products and the new one back into the file = appending new product
//     //     fs.writeFile(p, JSON.stringify(products), (err) => {
//     //       if (err) {
//     //         console.log(err);
//     //       }
//     //     });
//     //   }
//     // });
//   }
//   // -------------- IF DELETE PRODUCT IN MODEL -> ALSO MAKE SURE REMOVE PRODUCT IN CART -----
//   static delete(id) {
//     // ----------- USE CODE BELOW IF DELETING DATA IN JSON FILE -----------
//     // getProductsFromFile((products) => {
//     //   const product = products.find((product) => product.id === id);
//     //   if (product) {
//     //     const productPrice = product.price;
//     //     // last index is not included - splice out the object we dont want
//     //     // filter method returns a new array
//     //     const updatedArray = products.filter((product) => product.id !== id);
//     //     // insert the new array of products inside the file = override
//     //     fs.writeFile(p, JSON.stringify(updatedArray), (err) => {
//     //       if (!err) {
//     //         // now remove the product from the card
//     //         console.log(
//     //           "successfully deleted product in the products storage: ",
//     //           id
//     //         );
//     //         // ---------------- PROBLEM IS NOT EVERY PRODUCT IS IN THE CART -----------
//     //         Cart.deleteProduct(id, productPrice);
//     //       }
//     //     });
//     //   }
//     // });
//   }
//   // utitility function - call directly on the class itself and not on n instantiated object
//   // pass in a callback -> dont forget this is async code with fs.readFile
//   // -----------> NO NEED FOR CALLBACKS USE INSTEAD PRMISE
//   static fetchAll() {
//     // return promise
//     return db.execute("SELECT * FROM `node-complete`.products;");
//     // IF JSON FILE
//     // getProductsFromFile(cb);
//   }

//   // a callback which will be executed once we're done finding the product here
//   static findById(productId) {
//     // USE WHERE KEYWORD TO RESTRICT HTE NUMBER OF ROWS
//     return db.execute("SELECT * FROM products WHERE products.id = ?", [
//       productId,
//     ]);

//     // IF JSON FILE
//     //   getProductsFromFile((products) => {
//     //     // return just the object / if product is not exisiting return undefined
//     //     const filteredProduct = products.find(({ id }) => id === productId);
//     //     cb(filteredProduct);
//     //   });
//   }
// };

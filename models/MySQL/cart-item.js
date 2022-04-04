// ! ---------------------------- USING MYSQL ------------------------

// const Sequelize = require("sequelize").Sequelize;

// const sequelize = require("../util/database");

// // * ---------- INTERMEDIARY TABLE BETWEEN CART AND PRODUCTS ---------
// // One Cart should belong to a single user but many hold multiple products
// // but the cart table should hold the differenct cars which up ...
// const CartItem = sequelize.define("cartItem", {
//   id: {
//     type: Sequelize.INTEGER,
//     autoIncrement: true,
//     allowNull: false,
//     primaryKey: true,
//   },
//   // because each cart item is essentially a combination of a product and the
//   // id of the cart in which this prorduct lies and the quantity
//   quantity: Sequelize.INTEGER,
// });

// module.exports = CartItem;

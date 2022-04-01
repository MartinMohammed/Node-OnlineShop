const Sequelize = require("sequelize").Sequelize;
// connection pool
const sequelize = require("../util/database");

// THIS WILL BE ASSOCIATED WITH the given User (one to one) and
// the products which corresponds to userId in the intermediary table with the quantity of the CartItem (product)
const Order = sequelize.define("order", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  //   --------- COULD HAVE MORE INFORMATION SUCH AS: ADDRESS AND SO ...
});

module.exports = Order;

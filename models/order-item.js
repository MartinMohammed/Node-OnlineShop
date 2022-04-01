const Sequelize = require("sequelize").Sequelize;
const sequelize = require("../util/database");

// intermediary table between order and cart-item ?
const OrderItem = sequelize.define("orderItem", {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  quantity: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
});

module.exports = OrderItem;

const Sequelize = require("sequelize").Sequelize;
const sequilize = require("../util/database.js");

const User = sequilize.define("user", {
  // attributes / fields our product should have - structure of a user
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = User;

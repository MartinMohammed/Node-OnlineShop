// ------------ SEQUILIZE DEPENDS ON MYSQL2 PACKAGE: SO IT WILL DO ALL THE CODE BEHIND THE SCENES --------

require("dotenv").config();
const Sequilize = require("sequelize").Sequelize;
// instantiate from Sequilize class - it needs some configurations {database, username, password, options}
const {
  DATABASE_HOST: host,
  DATABASE_USER: user,
  DATABASE_NAME: database,
  DATABASE_PASSWORD: password,
} = process.env;
// ------------ CONNECT AUTOMATICALLY TO DATABASE / SET UP CONNECTION POOL ---------
// to show more options --> control and space
// to make clear we use mysql database / connect to
const sequilize = new Sequilize(database, user, password, {
  dialect: "mysql",
  host,
});

module.exports = sequilize;

// // ------------ CODE THAT WILL ALLOW TO CONNECT OT THE SQL DATABASE AND THEN GIVE US BACK A
// // ------------ CONNECTION OBJECT WHICH ALLOWS US TO RUN QUERIES
// const mysql = require("mysql2");

// const pool = mysql.createPool({
//   // pass in some inforamtion about our database engine, our database host we're connecting to
//   host,
//   user,
//   database,
//   password,
// });

// // async work
// module.exports = pool.promise();

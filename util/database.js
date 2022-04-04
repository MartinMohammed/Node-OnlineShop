// * ---------------------------- USING MONGODB ------------------------
// ! Connect to mongodb for every operation and not disconnect } not good
require("dotenv").config();
const { append } = require("express/lib/response");
const mongodb = require("mongodb");
const { default: mongoose } = require("mongoose");
// EXTRACT MONGO CLIENT CONSTRUCTOR
const MongoClient = mongodb.MongoClient;
const { MONGO_DATABASE_PASSWORD, MONGO_DATABASE_USERNAME } = process.env;
const MONGO_URL = `mongodb+srv://${MONGO_DATABASE_USERNAME}:${MONGO_DATABASE_PASSWORD}@cluster0.pqvdc.mongodb.net/shop?retryWrites=true&w=majority`;

// * ---------------- USING MONGOOSE ----------------
// set up a connection / mongoose will manage the once connection behind the sences for us
const mongooseConnect = (cb) => {
  mongoose
    .connect(MONGO_URL)
    .then((result) => {
      // cb => app.listen(3000)
      console.log("successfully connected to database.");
      cb();
    })
    .catch((err) => console.log(err));
};
exports.mongooseConnect = mongooseConnect;

// // show that is a private variable = only internally in file
// let _db;
// const mongoConnect = (callback) => {
//   // TAKES URL TO DATABASE TO CONNECT TO IT
//   MongoClient.connect(MONGO_URL)
//     // * The CLIENT boject gives us access to the shop
//     // * IF DATABSE DOES NOT EXIST = CREATE IT ON FLY
//     .then((client) => {
//       console.log("Successfully connected to MongoAtlas database");
//       // store access to the database - connect to shop
//       // can receive some additional config such as connecting to other db
//       // ! this will keep on running
//       _db = client.db();
//       callback();
//     })
//     .catch((err) => {
//       console.log(err);
//       throw err;
//     });
// };
// // * METHOD WHERE RETURN ACCESS TO THAT CONNECTED DATABASE IF IT EXISTS
// // *> Advantage: interact with db from different places in application
// // * BEHIND THE SCENES: connection pooling - make sure provides sufficient connections
// // * for multiple sumultaneous interactions with the database
// const getDb = () => {
//   if (_db) {
//     return _db;
//   }
//   throw "No database found";
// };
// exports.mongoConnect = mongoConnect;
// exports.getDb = getDb;

// ! ---------------------------- USING MYSQL ------------------------
// // ------------ SEQUILIZE DEPENDS ON MYSQL2 PACKAGE: SO IT WILL DO ALL THE CODE BEHIND THE SCENES --------

// require("dotenv").config();
// const Sequilize = require("sequelize").Sequelize;
// // instantiate from Sequilize class - it needs some configurations {database, username, password, options}
// const {
//   DATABASE_HOST: host,
//   DATABASE_USER: user,
//   DATABASE_NAME: database,
//   DATABASE_PASSWORD: password,
// } = process.env;
// // ------------ CONNECT AUTOMATICALLY TO DATABASE / SET UP CONNECTION POOL ---------
// // to show more options --> control and space
// // to make clear we use mysql database / connect to
// const sequilize = new Sequilize(database, user, password, {
//   dialect: "mysql",
//   host,
// });

// module.exports = sequilize;

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

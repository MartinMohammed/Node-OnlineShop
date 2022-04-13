// * ---------------- USING MONGODB NATIVE DRIVER ----------------
// ! Connect to mongodb for every operation and not disconnect } not good
require("dotenv").config();
const mongodb = require("mongodb");
const { default: mongoose } = require("mongoose");

// EXTRACT MONGO CLIENT CONSTRUCTOR
const MongoClient = mongodb.MongoClient;

// MONGO DATABASE CREDENTAILS
const { MONGO_DATABASE_PASSWORD, MONGO_DATABASE_USERNAME } = process.env;
const MONGO_URI = `mongodb+srv://${MONGO_DATABASE_USERNAME}:${MONGO_DATABASE_PASSWORD}@cluster0.pqvdc.mongodb.net/shop?retryWrites=true&w=majority`;

// * ---------------- USING MONGOOSE ----------------
// DATABASE CONNECTION POOL - SET UP ONCE
const mongooseConnect = (cb) => {
  mongoose
    .connect(MONGO_URI)
    .then((result) => {
      console.log("successfully connected to database.");
      // cb => app.listen(3000)
      cb();
    })
    .catch((err) => console.log(err));
};
exports.mongooseConnect = mongooseConnect;

// ! ---------------------- USING MONGO DB NATIVE DRIVER ---------------
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

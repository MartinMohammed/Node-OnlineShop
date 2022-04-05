// * ---------------------------- USING MONGOOSE ------------------------
const mongoose = require("mongoose");

// Schema constructor / extracted ({inside config/ blueprint})
const Schema = mongoose.Schema;

// Tell Mongoose/ Mongodb how our data will looks like (strucutre our data)
// * DELIBERATE DECISION TO GIVE UP SOME FLEXIBILITY BUT GAIN OTHER ADANTAGES
const productSchema = new Schema({
  // objedId will be automatically added like in native driver
  // could be deviated (abweischen) - we have the flexibility
  title: {
    // but now taking the flexibility off - creating a strict schema
    type: String,
    require: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  // userId of the creator of this product
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    // --------- relation setup -----------
    // set special ref configuration - which model is associated/ related to the data in that field
    // name of Model in application
    ref: "User",
    required: true,
  },
});

// * model is a function; important for mongoose behind the scenes to connect a schema, a blueprint with a name
// this is what we'll work with in our code.
module.exports = mongoose.model("Product", productSchema);

// * ---------------------------- USING MONGODB ------------------------
// const mongodb = require("mongodb");
// const getDb = require("../../util/database").getDb;

// // Create new class - because create a product model
// class Product {
//   constructor(title, price, description, imageUrl, id, userId) {
//     this.title = title;
//     this.price = price;
//     this.description = description;
//     this.imageUrl = imageUrl;
//     // id = string value of ObjectId
//     // empty id can also lead to an object id = this._id will not be undefined new ObjectId("6249b0eed3729afb5d122c08")
//     // now only if id exists assign object the objectId
//     // null will be treated as false in if block
//     this._id = id ? new mongodb.ObjectId(id) : null;
//     // store the user data so that we know who is connected = store reference
//     this.userId = userId;
//   }

//   save() {
//     // connect to mongodb and save the product (javaScript object)
//     // now have a connection which allows us to interact with the db
//     const db = getDb();
//     // db operation
//     let dbOp;
//     if (this._id) {
//       // update The product / updateMany - atleast two arguments filter , object
//       // updateOne will not "REPLACE" the item
//       dbOp = db.collection("products").updateOne(
//         // filter / new mongodb.ObjectId... can be not omitted } the _id will remain same.
//         // ! only be omitted if this._id is already a objectId object
//         { _id: new mongodb.ObjectId(this._id) },
//         // * describe the operation / special operator $set => replaces the vlaue of a field with the specified value.
//         // _id (objectId) will remain same
//         { $set: { ...this } }
//       );
//     } else {
//       dbOp = db.collection("products").insertOne(this);
//     }
//     // * call collection to tell mondb into which collection to insert someting or
//     // with which collection want to work with - if not created > create it on fly first time
//     // data is inserted

//     // Execute a couple of mongdb commands / operations (MongoDB CRUD operations)
//     // or insertMany([obj1, obj2]) -> the object will get converted to json by mongodb
//     return dbOp
//       .then((result) => {
//         console.log(result);
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }

//   static fetchAll() {
//     // find - findAll can get a filter as a object
//     // * find returns an cursor = object provided by mongodb
//     // * allows to go through elements, document step by
//     // * step (because not transfering all data immediately) - handle tell mongodb next document ...

//     // * toArray if couple of dozens or maybe one hodrent documents otherwise
//     // * impletement pagination
//     const db = getDb();
//     return db
//       .collection("products")
//       .find()
//       .toArray()
//       .then((products) => {
//         // console.log(products);
//         // return automatically a promise
//         return products;
//       })
//       .catch((err) => console.log(err));
//   }
//   static findById(productId) {
//     const db = getDb();
//     return (
//       db
//         .collection("products")
//         // * narrow down the search / find returns cursor object because mongodb
//         // * doesn't know that only get one
//         // * so we can use next function to get the next and in this case
//         // * here also the last document that returned by find here.

//         // ! it is a constructor which creates a new Mongodb objectId
//         .find({ _id: new mongodb.ObjectId(productId) })
//         .next()
//         .then((product) => {
//           // console.log(product);
//           return product;
//         })
//         .catch((err) => console.log(err))
//     );
//   }

//   static deleteById(productId) {
//     const db = getDb();
//     return db
//       .collection("products")
//       .deleteOne({ _id: new mongodb.ObjectId(productId) })
//       .then((result) => console.log("Deleted"))
//       .catch((err) => console.log(err));
//   }
// }
// module.exports = Product;

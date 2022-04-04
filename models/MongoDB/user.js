const mongodb = require("mongodb");
const getDb = require("../../util/database").getDb;

class User {
  // user id
  constructor(username, email, cart, id) {
    this.name = username;
    this.email = email;
    this.cart = cart; // {items: []}
    this._id = id;
  }

  save() {
    const db = getDb();
    return db.collection("users").insertOne(this);
  }

  addToCart(product) {
    // // if this returns something which is not -1 then the product exist already in the cart
    // const cartProduct = this.cart.items.findIndex((cp) => {
    //   return (cp._id = product._id);
    // });
    // if (cartProduct === -1){

    // }
    // ---------------- IF PRODUCT IS NOT IN THE CART -----------
    const updatedCart = { items: [{ ...product, quantity: 1 }] };
    const db = getDb();
    return db.collection("users").updateOne(
      // update the users cart
      { _id: new mongodb.ObjectId(this._id) },
      //   only the cart will be updated = overwrite the old one
      { $set: { cart: updatedCart } }
    );
  }
  //   userId => string
  static findById(userId) {
    const db = getDb();
    return (
      db
        .collection("users")
        // also findOne will not return cursor object
        .find({ _id: new mongodb.ObjectId(userId) })
        .next()
        .then((user) => {
          // Promise.resolve auto
          return user;
        })
        .catch((err) => console.log(err))
    );
  }
}

module.exports = User;

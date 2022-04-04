const res = require("express/lib/response");
const mongodb = require("mongodb");
const getDb = require("../../util/database").getDb;

class User {
  // user id
  constructor(username, email, cart, id) {
    this.name = username;
    this.email = email;
    // fetched from app.js User.findById
    this.cart = cart; // {items: [{productId Type: ObjectId, quantity}]}

    // dont confuse this._id with productId of a cartItem
    // type ObjectId accepted for mongodb
    this._id = id;
  }

  save() {
    const db = getDb();
    return db.collection("users").insertOne(this);
  }

  addToCart(product) {
    // // if this returns something which is not -1 then the product exist already in the cart
    const cartProductIndex = this.cart.items.findIndex((cp) => {
      // ! product is a instace retrieved from the database, we can treat ObjectId as string
      // but its type is not String
      // iterate through every cartProduct until the function returns true;
      return cp.productId.toString() === product._id.toString();
    });
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];

    // if item already exists
    if (cartProductIndex >= 0) {
      // get the product in the user cart and increase the quantity
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      // ---------------- IF PRODUCT IS NOT IN THE CART -----------
      // No duplicate data instead a reference to the product
      // *  items will be a property of a user instance / save reference to the product
      // avoid data duplication
      updatedCartItems.push({
        productId: new mongodb.ObjectId(product._id),
        quantity: newQuantity,
      });
    }
    const updatedCart = {
      items: updatedCartItems,
    };

    const db = getDb();
    return db.collection("users").updateOne(
      // update the users cart
      { _id: new mongodb.ObjectId(this._id) },
      //   only the cart will be updated = overwrite the old one
      { $set: { cart: updatedCart } }
    );
  }

  // * return cart of the current user
  getCart() {
    // Because of Mongo relations one-to-one user & cart
    // we can simply return the cart

    // * but if would be great when we return a fully polulated cart, so a cart
    // * with all the product details which we also require.
    // return this.cart;

    const db = getDb();
    // * find all products that are in the cart / use some special mongdb query operators
    // * $in operator takes an array of IDs : every id which is in the array will be accepted and
    // * will get back a cursor which holds references to all products with one of the id's mentioned
    // * in the array
    //   ---------------- MERGE DATA MANUALLY -----------------
    const productIds = this.cart.items.map((i) => i.productId);
    return db
      .collection("products")
      .find({ _id: { $in: [...productIds] } })
      .toArray()
      .then((products) => {
        // add the quantity back to the products
        // * this returns an array of [{product, ItsQuantity from UserCart}]
        return products.map((p) => {
          // *  first find th cartItem(userItem) where its productId (as a reference)
          // * machtes the _id of a Product
          // * second give us the quantity of the given product as cartItem
          const quantity = this.cart.items.find((cartItem) => {
            return p._id.toString() === cartItem.productId.toString();
          }).quantity;
          return {
            ...p,
            quantity,
          };
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  deleteItemFromCart(productId) {
    const db = getDb();
    // 1. fetch all cartItems from the current User (stored this)
    // 2. delete the cartItem we dont want from 1.
    // 3. update cartItems of the current User
    const updatedCartItems = this.cart.items.filter(
      (cartItem) => cartItem.productId.toString() !== productId.toString()
    );
    return db
      .collection("users")
      .updateOne(
        { _id: new mongodb.ObjectId(this._id) },
        { $set: { cart: { items: [...updatedCartItems] } } }
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
  //   this method here because "this" user executes an order
  addOrder() {
    //   ------------- ADDING RELATIONAL ORDER DATA -------------
    const db = getDb();
    return this.getCart()
      .then((products) => {
        // all the product information / quantity for the respective user
        const order = {
          // duplicate data - orders collection / user collection = availibitlity
          // * but it is okay because a user will not often change its username ...
          // * and also processed orders dont care for changed emails
          items: products,
          user: {
            _id: new mongodb.ObjectId(this._id),
            name: this.name,
            email: this.email,
          },
          order_date: new Date(),
        };

        // the data for the order is already registered on this user
        // * Either add the orders to the user or add the user to a order
        // * because you have a lot of orders and embedding = chaos / big
        // insertOne {items: []}
        return db.collection("orders").insertOne(order);
      })
      .then((result) => {
        //!  empty the cart locally
        this.cart = { items: [] };
        //! empty the cart in the db
        return db
          .collection("users")
          .updateOne({ _id: this._id }, { $set: { cart: { items: [] } } });
      });
  }

  getOrders() {
    const db = getDb();
    //   fetch orders from the given user
    // * check nested properties by defining the path to them as a string
    return db.collection("orders").find({ "user._id": this._id }).toArray();
  }
  //   getOrders() {
  //     const db = getDb();
  //     return db
  //       .collection("orders")
  //       .find({ "user._id": new mongodb.ObjectId(this._id) })
  //       .toArray();
  //   }
}

module.exports = User;

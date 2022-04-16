const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  // ------------------- USER INFORMATION --------------
  user: {
    // * DEFINE FIELDS WITH ITS "CONSTRAINTS"
    email: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      // for populating later
      ref: "User",
    },
  },
  // ------------------- ORDER ITEMS --------------
  // A LIST OF PRODUCTS
  products: [
    {
      // entire other document / could be more specific defined
      productData: { type: Object, required: true },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
});

module.exports = mongoose.model("Order", orderSchema);

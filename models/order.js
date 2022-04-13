const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    // * DEFINE FIELDS WITH ITS "CONSTRAINTS"
    // name: {
    //   type: String,
    //   required: true,
    // },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      // for populating later
      ref: "User",
    },
  },
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

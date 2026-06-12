const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema({
  name: String,
  type: String,
  quantity: Number,       // current available quantity
  totalQuantity: Number,  // original total (set on creation)
  status: {
    type: String,
    enum: ["available", "booked"],
    default: "available",
  },
});

 
module.exports = mongoose.model("Asset", assetSchema);
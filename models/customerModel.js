const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    fname: {
      type: String,
      required: true,
      trim: true,
    },
    lname: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    phone: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    dob: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    created_timestamp: {
      type: Date,
      required: true,
      default: new Date(),
    },
  },
  { optimisticConcurrency: true }
);

const Customer = mongoose.model("Customer", customerSchema);
//const Item = mongoose.model('Item',itemSchema)

module.exports = {
  Customer,
};

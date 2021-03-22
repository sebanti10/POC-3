const mongoose = require("mongoose");
const crypto = require('crypto');

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
    salt: String,
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

customerSchema.methods.getPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hashedPassword = crypto.pbkdf2Sync(password, salt,  
    1000, 64, `sha512`).toString(`hex`);
  return  {
    salt,
    hashedPassword
  }
};

customerSchema.methods.validPassword = function(password) {
  const hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex'); 
  return this.password === hash;
};

const Customer = mongoose.model("Customer", customerSchema);

module.exports = {
  Customer,
};

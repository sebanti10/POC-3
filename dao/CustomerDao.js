const mongoose = require("mongoose");
const { Customer } = require("../models/customerModel");

class CustomerDao {
  constructor(containerId) {
    console.log(`Using ${containerId} from mongoDb Atlas`);
  }

  async findByEmail(email) {
    const customer = await Customer.findOne({ email });
    if (customer) {
      return customer;
    } else {
      return undefined;
    }
  }

  async findByPhone(phone) {
    const customer = await Customer.findOne({ phone });
    if (customer) {
      return customer;
    } else {
      return undefined;
    }
  }

  async createNewCustomer(fname, lname, email, dob, password, phone) {
    const customer = await new Customer({
      fname,
      lname,
      email,
      dob,
      phone,
    });
    const {salt, hashedPassword} = customer.getPassword(password);
    customer.salt = salt;
    customer.password = hashedPassword;

    return customer;
  }
  async deleteCustomer(customer) {
    await customer.delete();
  }

  async saveCustomer(customer) {
    await customer.save();
  }
}

module.exports = CustomerDao;

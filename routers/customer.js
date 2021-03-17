const express = require("express");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const { Customer } = require("../models/customer");

const router = new express.Router();

const checkNullString = (str) => {
  if (typeof str === "string" && !str.replace(/\s/g, "").length) {
    return true;
  } else {
    return false;
  }
};

router.post("/register", async (req, res) => {
  if (!req.body) {
    res.status(400).send({ error: "body is missing in the request" });
    return;
  }
  const { fname, lname, email, password, dob, phone } = req.body;
  if (!fname || checkNullString(fname)) {
    res
      .status(400)
      .send({ error: "fname is missing or empty in the request body" });
    return;
  }
  if (!lname || checkNullString(lname)) {
    res
      .status(400)
      .send({ error: "lname is missing or empty in the request body" });
    return;
  }
  if (!email || checkNullString(email) || !validator.isEmail(email)) {
    res.status(400).send({
      error:
        "email is missing or empty or not in the correct format in the request body",
    });
    return;
  }
  if (!dob || checkNullString(dob)) {
    res.status(400).send({
      error: "dob is missing or empty in the request body",
    });
    return;
  }
  if (!password || checkNullString(password)) {
    res.status(400).send({
      error: "password is missing or empty in the request body",
    });
    return;
  }
  if (!phone || checkNullString(phone)) {
    res.status(400).send({
      error: "phone is missing or empty in the request body",
    });
    return;
  }

  try {
    let customers = await Customer.find({ email });
    if (customers.length !== 0) {
      throw "email is already is registered. Please login!";
    }
    customers = await Customer.find({ phone });
    if (customers.length !== 0) {
      throw "phone is already is registered. Please login!";
    }

    password = await bcrypt.hash(password, 8);
    const customer = new Customer({
      fname,
      lname,
      email,
      dob,
      password,
      phone,
    });
    await customer.save();
    res
      .status(201)
      .send({ message: "Customer registered successfully", customer });
  } catch (err) {
    return res.status(500).send({ error: err });
  }
});

module.exports = router;

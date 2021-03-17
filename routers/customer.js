const express = require("express");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const { Customer } = require("../models/customer");

const router = new express.Router();
const salt = bcrypt.genSaltSync(10);

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
  if (!email || checkNullString(email)) {
    res.status(400).send({
      error: "email is missing or empty in the request body",
    });
    return;
  }
  if (!validator.isEmail(email)) {
    res.status(400).send({
      error: "email format is incorrect",
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
    let customer = await Customer.findOne({ email });
    if (customer) {
      res.status(400).send({
        error: "email is already is registered. Please login!",
      });
      return;
    }
    customer = await Customer.findOne({ phone });
    if (customer) {
      res.status(400).send({
        error: "phone is already is registered. Please login!",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, salt);
    const newCustomer = new Customer({
      fname,
      lname,
      email,
      dob,
      password: hashedPassword,
      phone,
    });
    await newCustomer.save();
    res.status(201).send({ message: "Registration successful!", newCustomer });
  } catch (err) {
    return res.status(500).send({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  if (!req.body) {
    res.status(400).send({ error: "body is missing in the request" });
    return;
  }
  const { phone, password } = req.body;
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
    let customer = await Customer.findOne({ phone });
    if (!customer) {
      res.status(404).send({
        error: "Phone No. is not registered. Please register!",
      });
      return;
    }
    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      res.status(401).send({
        error: "Incorrect Password!",
      });
      return;
    }

    res.status(200).send({ message: "Login successful!", customer });
  } catch (err) {
    return res.status(500).send({ error: "Internal server error" });
  }
});

module.exports = router;

const express = require("express");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const { Customer } = require("../models/customer");

const router = new express.Router();

const checkAge = dob => {
  const year = dob.split("-")[2];

  if (year < 2003)
    return true;
  else
    return false; 
};

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

  if(!checkAge(dob)) {
    res.status(400).send({
      warning: "Customer has to be 18 years or older"
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

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const customer = new Customer({
      fname,
      lname,
      email,
      dob,
      password: hashedPassword,
      phone,
    });
    await customer.save();
    res
      .status(201)
      .send({ message: "Registration successful!", customer });
  } catch (err) {
    return res.status(500).send({ error: err });
  }
});

router.put("/update", async (req, res) => {
  if (!req.body) {
    res.status(400).send({ error: "body is missing in the request" });
    return;
  }

  const { phone, password } = req.body;

  if (!phone || checkNullString(phone)) {
    res.status(400).send({
      error: "phone is missing or empty in the request body",
    });
    return;
  }

  if (!password || checkNullString(password)) {
    res.status(400).send({
      error: "password is missing or empty in the request body",
    });
    return;
  }

  try {
    await Customer.findOneAndUpdate({ phone, password }, req.body, {new: true}, (err, customer) => {
      if(req.body.dob && !checkAge(req.body.dob)) {
        res.status(400).send({
          warning: "Customer has to be 18 years or older"
        });
        return;
      }

      if(err || customer===null) {
        res.status(400).send({
          error: "Update failed"
        });
      } else {
        res.status(200).send({
          message: "Successfully updated!",
          customer
        });
      }
    });
  } catch(err) {
    return res.status(500).send({ error: err });
  }
});

router.delete("/delete", async (req, res) => {
  if (!req.body) {
    res.status(400).send({ error: "body is missing in the request" });
    return;
  }

  const { phone, password } = req.body;

  if (!phone || checkNullString(phone)) {
    res.status(400).send({
      error: "phone is missing or empty in the request body",
    });
    return;
  }

  if (!password || checkNullString(password)) {
    res.status(400).send({
      error: "password is missing or empty in the request body",
    });
    return;
  }

  try {
    await Customer.findOneAndRemove({ phone, password }, (err, customer) => {

      if(err || customer === null) {
        res.status(400).send({
          error: "Customer not found"
        });
      } else {
        res.status(200).send({
          message: "Successfully deleted!",
          customer
        });
      }
    });
  } catch(err) {
    return res.status(500).send({ error: err });
  }
});

module.exports = router;

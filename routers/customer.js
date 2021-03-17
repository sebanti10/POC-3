const express = require("express");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const { Customer } = require("../models/customer");

const router = new express.Router();
const salt = bcrypt.genSaltSync(10);

const checkAge = (dob) => {
  const dateArr = dob.split("-");
  const DOB = new Date(
    parseInt(dateArr[2]),
    parseInt(dateArr[1]),
    parseInt(dateArr[0])
  );
  const diff_ms = Date.now() - DOB.getTime();
  const age_dt = new Date(diff_ms);

  const age = Math.abs(age_dt.getUTCFullYear() - 1970);

  if (age >= 18) return true;
  else return false;
};

const checkNullString = (str) => {
  if (typeof str === "string" && !str.replace(/\s/g, "").length) {
    return true;
  } else {
    return false;
  }
};

router.post("/register", async (req, res) => {
  if (Object.keys(req.body).length === 0 && req.body.constructor === Object) {
    res.status(400).send({ error: "request body is empty" });
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

  if (!checkAge(dob)) {
    res.status(400).send({
      warning: "Customer has to be 18 years or older",
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
  if (Object.keys(req.body).length === 0 && req.body.constructor === Object) {
    res.status(400).send({ error: "request body is empty" });
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

router.put("/update", async (req, res) => {
  if (Object.keys(req.body).length === 0 && req.body.constructor === Object) {
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
    const customer = await Customer.findOne({ phone });

    if (!customer) {
      res.status(404).send({
        error: "No phone number found",
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, customer.password);

    if (!isMatch) {
      res.status(401).send({
        error: "Incorrect password",
      });
      return;
    }

    if (req.body.dob) {
      if (!checkAge(req.body.dob)) {
        res.status(400).send({
          warning: "Customer has to be 18 years or older",
        });
        return;
      }
      customer.dob = req.body.dob;
    }

    if (req.body.email) {
      if (!validator.isEmail(req.body.email)) {
        res.status(400).send({
          warning: "Invalid Email Address.",
        });
        return;
      }

      const newCustomer = await Customer.findOne({ email: req.body.email });

      if (newCustomer) {
        return res.status(400).send({
          warning: "Email Address already exists.",
        });
      }
      customer.email = req.body.email;
    }

    if (req.body.fname && !checkNullString(req.body.fname))
      customer.fname = req.body.fname;

    if (req.body.lname && !checkNullString(req.body.lname))
      customer.lname = req.body.lname;

    await customer.save();

    res.status(200).send({
      message: "Successfully updated!",
      customer,
    });
    return;
  } catch (err) {
    return res.status(500).send({ error: err });
  }
});

router.delete("/delete", async (req, res) => {
  if (Object.keys(req.body).length === 0 && req.body.constructor === Object) {
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
    const customer = await Customer.findOne({ phone });

    if (!customer) {
      res.status(404).send({
        error: "No phone number found",
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, customer.password);

    if (!isMatch) {
      res.status(404).send({
        error: "Incorrect password",
      });
      return;
    }

    await customer.delete();

    res.status(200).send({
      message: "Successfully deleted!",
      customer,
    });
    return;
  } catch (err) {
    return res.status(500).send({ error: err });
  }
});

module.exports = router;

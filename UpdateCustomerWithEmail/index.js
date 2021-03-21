const express = require("express");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const {
  checkNullString,
  checkAge,
  checkPhoneNumber,
} = require("../utils/utils");
const CustomerDao = require("../dao/CustomerDao");

const router = new express.Router();
const salt = bcrypt.genSaltSync(10);

router.put("/updateWithEmail", async (req, res) => {
  const customerDao = new CustomerDao("customers");

  if (Object.keys(req.body).length === 0 && req.body.constructor === Object) {
    res.status(400).send({ error: "body is missing in the request" });
    return;
  }

  const { email, password } = req.body;

  if (!email || checkNullString(email)) {
    res.status(400).send({
      error: "email is missing or empty in the request body",
    });
    return;
  }

  if (!validator.isEmail(email)) {
    res.status(400).send({
      warning: "Invalid Email Address.",
    });
    return;
  }

  if (!password || checkNullString(password)) {
    res.status(400).send({
      error: "password is missing or empty in the request body",
    });
    return;
  }

  const updates = Object.keys(req.body).filter((update) => {
    return update !== "email" && update !== "password";
  });

  const allowedUpdates = ["phone", "dob", "fname", "lname"];
  const isValidOption = updates.every((update) => {
    return allowedUpdates.includes(update);
  });
  if (!isValidOption) {
    return res
      .status(400)
      .send({ error: "Invalid update parameters in request body" });
  }

  try {
    const customer = await customerDao.findByEmail(email);

    if (!customer) {
      res.status(404).send({
        error: "No email address found",
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

    if (req.body.phone) {
      if (!checkPhoneNumber(req.body.phone)) {
        console.log(req.body.phone);
        res.status(400).send({
          error: "Phone number has to be 10 digits!",
        });
        return;
      }
      const newCustomer = await customerDao.findByPhone(req.body.phone);

      if (newCustomer) {
        if (newCustomer.email === email) {
          return res.status(400).send({
            warning: "You are already registered with this phone no.",
          });
        } else {
          return res.status(400).send({
            warning: "This phone no. does not belong to you!",
          });
        }
      }
      customer.phone = req.body.phone;
    }

    if (req.body.fname && !checkNullString(req.body.fname))
      customer.fname = req.body.fname;

    if (req.body.lname && !checkNullString(req.body.lname))
      customer.lname = req.body.lname;

    await customerDao.saveCustomer(customer);

    res.status(200).send({
      message: "Successfully updated!",
      customer,
    });
    return;
  } catch (err) {
    return res.status(500).send({ error: "Something went wrong!" });
  }
});

module.exports = router;

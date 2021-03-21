const express = require("express");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const { checkNullString, checkAge } = require("../utils/utils");
const CustomerDao = require("../dao/CustomerDao");

const router = new express.Router();
const salt = bcrypt.genSaltSync(10);

router.put("/updateWithPhone", async (req, res) => {
  const customerDao = new CustomerDao("customers");

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

  const updates = Object.keys(req.body).filter((update) => {
    return update !== "phone" && update !== "password";
  });

  const allowedUpdates = ["email", "dob", "fname", "lname"];
  const isValidOption = updates.every((update) => {
    return allowedUpdates.includes(update);
  });
  if (!isValidOption) {
    return res
      .status(400)
      .send({ error: "Invalid update parameters in request body" });
  }

  try {
    const customer = await customerDao.findByPhone(phone);

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

      const newCustomer = await customerDao.findByEmail(req.body.email);

      if (newCustomer) {
        if (newCustomer.phone === phone) {
          return res.status(400).send({
            warning: "You are already registered with this email",
          });
        } else {
          return res.status(400).send({
            warning: "This email address does not belong to you!",
          });
        }
      }
      customer.email = req.body.email;
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

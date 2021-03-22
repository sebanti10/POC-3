const express = require("express");
const {
  checkNullString,
  checkAge,
  checkPhoneNumber,
  checkDOBFormat,
  validateEmail
} = require("../utils/utils");
const CustomerDao = require("../dao/CustomerDao");

const router = new express.Router();

router.post("/register", async (req, res) => {
  const customerDao = new CustomerDao("customers");

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
  if (!validateEmail(email)) {
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
  if (!checkDOBFormat(dob)) {
    res.status(400).send({
      error: "dob is not in the correct format",
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

  if (!checkPhoneNumber(phone)) {
    res.status(400).send({
      error: "Phone number has to be 10 digits!",
    });
    return;
  }
  if (!phone.match(/^([0-9]{10})$/)) {
    res.status(400).send({
      error: "Phone number is not in the correct format",
    });
    return;
  }

  try {
    console.log(req.body);
    let customer = await customerDao.findByEmail(email);
    if (customer) {
      res.status(400).send({
        error: "email is already is registered. Please login!",
      });
      return;
    }
    customer = await customerDao.findByPhone(phone);
    if (customer) {
      res.status(400).send({
        error: "phone is already is registered. Please login!",
      });
      return;
    }

    const newCustomer = await customerDao.createNewCustomer(
      fname,
      lname,
      email,
      dob,
      password,
      phone
    );
    await customerDao.saveCustomer(newCustomer);
    res.status(201).send({ message: "Registration successful!", newCustomer });
  } catch (err) {
    return res.status(500).send({ error: "Something went wrong!" });
  }
});

module.exports = router;

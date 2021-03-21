const express = require("express");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const { checkNullString } = require("../utils/utils");
const CustomerDao = require("../dao/CustomerDao");

const router = new express.Router();
const salt = bcrypt.genSaltSync(10);

router.post("/login", async (req, res) => {
  const customerDao = new CustomerDao("customers");

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
    let customer = await customerDao.findByPhone(phone);
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
    return res.status(500).send({ error: "Something went wrong!" });
  }
});

module.exports = router;

const express = require("express");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const { checkNullString } = require("../utils/utils");
const CustomerDao = require("../dao/CustomerDao");

const router = new express.Router();
const salt = bcrypt.genSaltSync(10);

router.delete("/delete", async (req, res) => {
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
      res.status(404).send({
        error: "Incorrect password",
      });
      return;
    }

    await customerDao.deleteCustomer(customer);

    res.status(200).send({
      message: "Successfully deleted!",
      customer,
    });
    return;
  } catch (err) {
    return res.status(500).send({ error: "Something went wrong!" });
  }
});

module.exports = router;

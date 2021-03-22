const express = require("express");
const { checkNullString } = require("../utils/utils");
const CustomerDao = require("../dao/CustomerDao");

const router = new express.Router();

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

    if(!customer.validPassword(password)) {
      console.log('error');
      res.status(401).send({
        error: "Incorrect Password!",
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

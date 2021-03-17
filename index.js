const express = require("express");
const mongoose = require("mongoose");

mongoose.Promise = global.Promise;
mongoose.connect(
  "mongodb://localhost:27017/Qmin",
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  },
  function (err) {
    if (err) return console.log(err);
    console.log("database is connected");
  }
);

const customerRouter = require("./routers/customer");

const app = express();
app.use(express.json());
app.use(customerRouter);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

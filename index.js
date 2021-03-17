const express = require("express");
const mongoose = require("mongoose");

// port number
const PORT = process.env.PORT || 9000;

mongoose.Promise = global.Promise;
mongoose.connect(
  "mongodb+srv://admin-user:Test123@cluster0.hu1gt.mongodb.net/customerDB?retryWrites=true&w=majority",
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

// listening on port
app.listen(9000, () => {
  console.log(`Server is running on port: ${PORT}`);
});
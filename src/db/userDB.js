require("dotenv").config();
const mongoose = require("mongoose");
mongoose.connect(process.env.DATABASE_HOST)
  .then(() => {
    console.log("database okay");
  })
  .catch((error) => {
    console.log(error);
  });

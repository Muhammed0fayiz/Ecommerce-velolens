const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_STR)
  .then(() => {
    console.log("Mongo connected successfully")
  })
  .catch((error) => {
    console.log(error);
  });




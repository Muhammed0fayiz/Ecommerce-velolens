const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/Velocity')
  .then(() => {
    console.log("Mongo connected successfully")
  })
  .catch((error) => {
    console.log(error);
  });




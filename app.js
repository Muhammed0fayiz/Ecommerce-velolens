const express = require('express');
const app = express();
const path = require('path');

const nocache = require('nocache')
const adminRouter = require('./routes/admin')
const userRouter = require('./routes/user')
const profileRouter = require('./routes/profile')
const cartRouter = require('./routes/cart')
const wishlistRouter=require('./routes/wishlist')
const orderRouter = require('./routes/order')
const paymentRouter = require('./routes/payment')
const bodyParser = require('body-parser')
const errormiddleware = require('./middleware/errormiddleware');

require('dotenv').config();
const logger = require('morgan');
const port = process.env.PORT || 3001;

app.use(errormiddleware)
app.use(logger('dev'));
const server = require('./server')

app.set('view engine', 'ejs');

//static file
app.use(express.static(path.join(__dirname, 'public')));

//middleware
app.use(nocache())
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));






// connect the routes page
app.use('/', userRouter)
app.use('/admin', adminRouter)
app.use('/profile', profileRouter)
app.use('/cart', cartRouter)
app.use('/wishlist',wishlistRouter)
app.use('/order', orderRouter)
app.use('/', paymentRouter)


// errorpage middleware
app.use(function (req, res, next) {
  res.status(404);
  res.render('user/error');
});

// Error-handling middleware
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  console.log(err);
  res.render('user/error');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

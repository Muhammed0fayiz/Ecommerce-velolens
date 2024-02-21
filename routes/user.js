const express = require('express')
const router = express.Router()
const session = require('express-session');
const usercollection = require('../models/users')
const Couponcontroller=require('../controller/couponcontroller')
//connect the controller
const Usercontroller = require('../controller/usercontroller')
const Productcontroller = require('../controller/productcontroller')
const CheckSessionAndBlocked = require('../middleware/usermiddleware')


//session handling
router.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);


// userguest
router.get('/', Usercontroller.UserGuest)
// userlogin
router.get('/userlogin', Usercontroller.UserLogin)
//user login post
router.post('/loginPost', Usercontroller.UserLoginPost)

//signup page get
router.get('/usersignup', Usercontroller.UserSignup)
//signup post
router.post('/signupPost', Usercontroller.SignupPost)
//otp render page
router.get('/usersignup/signupOtp', Usercontroller.SignupOtp)
//otp post
router.post('/usersignup/otpPost', Usercontroller.OtpPost)
//resend otp
router.get('/resendotp', Usercontroller.ResendOtp)

// userhome
router.get('/userhome',CheckSessionAndBlocked, Usercontroller.UserHome)
// productview
router.get('/productView/:id', CheckSessionAndBlocked, Usercontroller.ProductView)
// shop page get
router.get('/shop', CheckSessionAndBlocked, Usercontroller.ShopPage)
// search product
router.get('/search/:productName', Productcontroller.ProductSearch)
// filter sort 
router.post('/shopfilter', Productcontroller.HandleShopPageFilter);


//show allcoupon user
router.get('/showcoupon',CheckSessionAndBlocked,Couponcontroller.ShowCoupon)
// backbutton to coupon
router.get('/couponbackbutton',CheckSessionAndBlocked,Couponcontroller.BackButton)
// apply coupon
router.post('/coupencheck',Couponcontroller.coupencheck)
//logout
router.get('/logoutuser', Usercontroller.Logout)




module.exports = router
const express = require('express')
const router = express.Router()
const session = require('express-session');
const usercollection = require('../models/users')
//connect the controller
const Usercontroller = require('../controller/usercontroller')
const Productcontroller = require('../controller/productcontroller')
const Categorycontroller = require('../controller/cartcontroller')
const Cartcontroller = require('../controller/cartcontroller')
const CheckSessionAndBlocked = require('../middleware/usermiddleware')

// cartpage render
router.get('/cartpage', CheckSessionAndBlocked, Cartcontroller.CartPage)
//add to cart render
router.get('/addtocart/:id', CheckSessionAndBlocked, Cartcontroller.AddTOCart)
//delect item form cart
router.get('/deleteItem/:id', CheckSessionAndBlocked, Cartcontroller.DeleteCartItem)
// UpdateQuantity 
router.post('/updateQuantity/:id', Cartcontroller.UpdateQuantity);


// checkoutpage render
router.get('/checkoutpage', Cartcontroller.CheckOut)
//checkout add address
router.get('/addaddress', CheckSessionAndBlocked, Cartcontroller.AddAddress)
//checkout add address post
router.post('/addaddresspost', Cartcontroller.AddAddressPost)


module.exports = router;
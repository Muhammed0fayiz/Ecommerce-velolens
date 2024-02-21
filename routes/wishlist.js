const express = require('express')
const router = express.Router()
const session = require('express-session');
const usercollection = require('../models/users')
//connect the controller
const Usercontroller = require('../controller/usercontroller')
const Productcontroller = require('../controller/productcontroller')
const Categorycontroller = require('../controller/cartcontroller')
const Cartcontroller = require('../controller/cartcontroller')
const wishlistcontroller=require('../controller/wishlistcontroller')
const CheckSessionAndBlocked = require('../middleware/usermiddleware')


//wishlist page
router.get('/wishlistpage',CheckSessionAndBlocked,wishlistcontroller.Wishlist)
//addwish list
router.get('/addtowishlist/:id',CheckSessionAndBlocked,wishlistcontroller.AddToWishlist)
//wishlist remove
router.get('/wishlistremove/:id',CheckSessionAndBlocked,wishlistcontroller.WishlistRemove)



module.exports = router
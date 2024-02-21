const express = require('express')
const router = express.Router()
const session = require('express-session');
const usercollection = require('../models/users')
//connect the controller
const Usercontroller = require('../controller/usercontroller')
const Productcontroller = require('../controller/productcontroller')
const Ordercontroller = require('../controller/ordercontroller')
const CheckSessionAndBlocked = require('../middleware/usermiddleware')
const profilecontroler = require('../controller/profilecontroler')

// orderpage conform
router.get('/orderconfirm', Ordercontroller.ConfirmOrderget);
// order conform
router.post('/orderconfirm', Ordercontroller.ConfirmOrderPost)
//order status chage
router.get('/orderstatus/:id/:orderid', profilecontroler.OrderCancel)
//order return
router.get('/orderreturn/:id/:orderid', profilecontroler.OrderReturn)
//orderproductview
router.get('/orderproductview/:id/:orderid', profilecontroler.OrderViewMore)
//invoice downloads
router.get('/invoice/:orderid', CheckSessionAndBlocked, profilecontroler.Invoice)

//orderpage render admin
router.get('/orderpage', Ordercontroller.Orderpage)



module.exports = router;
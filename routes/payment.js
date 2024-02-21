const express = require('express');
const router = express.Router();
const paymentorder=require('../controller/paymentcontroller')

router.post('/create/orderId',paymentorder.OrderPayment)

module.exports=router 
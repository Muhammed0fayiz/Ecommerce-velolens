const express = require('express');
const Razorpay = require('razorpay');
require('dotenv').config();
const cartcollection = require('../models/cart')
const ordercollection = require('../models/order')

// console.log(instance);
const 
OrderPayment = async (req, res) => {
  try {
    console.log('here bck');
    const { amount } = req.body;
    var instance = new Razorpay({ key_id: process.env.KEY_ID, key_secret: process.env.KEY_SECRET });
    var options = {
      amount: amount * 100, // Convert amount to the smallest currency unit (e.g., paise in INR)
      currency: "INR",
      receipt: "order_rcptid_11",
    };

    // Creating the order
    instance.orders.create(options, function (err, order) {
      if (err) {
        console.error(err);
        res.status(500).send("Error creating order");
        return;
      }

      res.send({ orderId: order.id });

    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};



module.exports = {
  OrderPayment

}

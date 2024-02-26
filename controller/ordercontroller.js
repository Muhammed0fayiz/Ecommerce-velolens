const express = require('express');
const router = express.Router();
const usercollection = require('../models/users')
const productcollection = require('../models/product')
const categorycollection = require('../models/category')
const ordercollection = require('../models/order')
const addresscollection = require('../models/address')
const cartcollection = require('../models/cart');
const couponcollection = require('../models/coupon')




const ConfirmOrderPost = async (req, res) => {
    try {
        const applycoupon = req.body.coupencode;
        const userId = req.session.user;

        const cartItems = await cartcollection.find({ userid: userId });
        const addressid = req.body.address;
        const payment = req.body.payment;
        const coupon = await couponcollection.findOne({ couponcode: applycoupon });

        const user = await usercollection.findOne({ _id: userId });
        const productCollection = cartItems.map(cartItem => {
            return {
                productid: cartItem.productid,
                productName: cartItem.productname,
                Category: cartItem.Category,
                price: cartItem.price,
                quantity: cartItem.quantity,
                status: "pending"
            };
        });

        // Calculate total amount without discount
        let totalAmount = productCollection.reduce((total, product) => {
            return total + (product.price * product.quantity);
        }, 0);

        let discountApplied = 0; // Initialize discount applied

        // Check if coupon exists and is valid
        if (coupon && coupon.expiredate > new Date() && totalAmount >= coupon.purchaseamount) {
            discountApplied = coupon.discount; // Set discount applied
            totalAmount -= discountApplied; // Apply discount to total amount
        }

        // Calculate individual discount amount for each item in cart
        const invdiscount = cartItems.length > 0 ? discountApplied / cartItems.length : 0;

        if (payment === 'WalletPayment') {
            if (user.wallet >= totalAmount) {
                user.wallet -= totalAmount;

                // Push transaction to wallet history
                user.Wallethistory.push({
                    amount: -totalAmount,
                    Date: new Date(),
                    Status: "Payment for order"
                });
            } else {
                return res.status(400).send('Insufficient funds in wallet');
            }
        }

        const currentDate = new Date();

        for (const item of cartItems) {
            await productcollection.updateOne(
                { _id: item.productid },
                { $inc: { Stock: -item.quantity } }
            );
        }

        const order = {
            userid: req.session.user,
            username: user.username,
            productcollection: productCollection,
            address: addressid,
            paymentmode: payment,
            orderdate: currentDate,
            totalPrice: totalAmount,
            discount: discountApplied, // Include applied discount in order
            invdiscount: invdiscount // Include individual discount in order
        };

        // Update user's wallet amount and transaction history
        await usercollection.findByIdAndUpdate({ _id: userId }, { wallet: user.wallet, $push: { Wallethistory: user.Wallethistory } });

        await ordercollection.insertMany([order]);
        await cartcollection.deleteMany({ userid: userId });

        res.redirect('/order/orderconfirm');
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = ConfirmOrderPost;




// conform page render
const ConfirmOrderget = async (req, res) => {

    try {
        const userid = req.session.user;
        const user = await usercollection.findById(userid)
        res.render('user/orderconfirm', { user })
    } catch (error) {
        console.log(error)

    }
};

const Orderpage = async (req, res) => {
    try {

        // Retrieve orders sorted by _id in descending order
        const orders = await ordercollection.find().sort({ _id: -1 });

        // Collect addresses in an array
        const addresses = [];

        // Loop through each order and print only the address
        for (const order of orders) {
            const addressId = order.address;

            // Retrieve address using addressId
            const address = await addresscollection.findById(addressId);

            // Add address to the array
            addresses.push(address);
        }

        res.render('admin/orderdetails', { order: orders, addresses });
    } catch (error) {
        console.error(`Error in Orderpage: ${error.message}`);
        res.status(500).send('Internal Server Error');
    }
};
const OrderStatusPost = async (req, res) => {
    const productid = req.params.id;
    const userid = req.params.userid;
    const newstatus = req.body.status;

    try {
        const order = await ordercollection.findOneAndUpdate(
            { userid, 'productcollection._id': productid },
            { $set: { 'productcollection.$.status': newstatus } },
            { new: true }
        );

        if (!order) {
            return res.status(404).send("Order not found");
        }

        if (newstatus === 'cancelled') { // Only update wallet for cancelled orders
            // Check if payment mode is 'WalletPayment' or 'OnlinePayment'
            if (order.paymentmode === 'WalletPayment' || order.paymentmode === 'OnlinePayment') {
                const product = order.productcollection.find(product => product._id.toString() === productid);
                const amountToAdd = (product.price * product.quantity) - order.invdiscount;
                // Find user and update wallet amount
                const user = await usercollection.findById(userid);
                user.wallet += amountToAdd;
                // Push the transaction to wallet history
                user.Wallethistory.push({
                    amount: amountToAdd,
                    Date: new Date(),
                    Status: "Debited"
                });
                await user.save();
            }
        }
        return res.redirect('/admin/orderpage');
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
};


//order filter data admin
const OrderFilter = async (req, res) => {

    try {
        const startDate = new Date(req.body.start_date);
        const endDate = new Date(req.body.end_date);

        // Filter orders by date
        const orders = await ordercollection.find({
            orderdate: { $gte: startDate, $lte: endDate }
        }).sort({ orderdate: -1 });
        const addresses = [];

        // Loop through each order and print only the address
        for (const order of orders) {
            const addressId = order.address;

            // Retrieve address using addressId
            const address = await addresscollection.findById(addressId);

            // Add address to the array
            addresses.push(address);
        }

        res.render('admin/orderdetails', { order: orders, addresses });
    } catch (error) {
        console.error(`Error in Orderpage: ${error.message}`);
        res.status(500).send('Internal Server Error');
    }
};



module.exports = {
    ConfirmOrderget,
    ConfirmOrderPost,
    Orderpage,
    OrderStatusPost,
    OrderFilter
}

const express = require('express');
const router = express.Router();
const usercollection = require('../models/users')
const productcollection = require('../models/product')
const categorycollection = require('../models/category')
const couponcollection = require('../models/coupon')


// couponpage get admin
const CouponPage = async (req, res) => {
    try {
        const data = await couponcollection.find()
        res.render('admin/coupon', { data })

    } catch (error) {
        console.log(error)
    }
}


//add coupon admin
const AddCoupon = (req, res) => {
    res.render('admin/addcoupon')
}



const AddCouponPost = async (req, res) => {
    try {
        const couponCode = req.body.couponCode; // Changed from req.body.couponCode to req.body.couponCode
        // Check if the coupon code already exists in the database
        const existingCoupon = await couponcollection.findOne({ couponcode: couponCode });
        if (existingCoupon) {
            // If the coupon code already exists, send an error message to the same page
            return res.status(400).send({ error: "Coupon code already exists." });
        }

        // If the coupon code doesn't exist, proceed with inserting the new coupon
        const data = {
            couponcode: couponCode,
            discount: req.body.discount,
            expiredate: req.body.expireDate,
            purchaseamount: req.body.purchaseAmount
        };
        await couponcollection.insertMany([data]);
        res.redirect('/admin/coupon');
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: "Internal server error." });
    }
};


const ShowCoupon = async (req, res) => {
    const coupons = await couponcollection.find()

    res.render('user/applycoupon', { coupons })
}

const BackButton = (req, res) => {
    res.redirect('/cart/checkoutpage')
}
const coupencheck = async (req, res) => {
    try {
        console.log('coupon appled suceessons ')
        let currentDate = new Date();
        const couponcode = req.body.coupencode;

        if (req.session.coupon && couponcode.toLowerCase() === req.session.coupon.toLowerCase()) {
            console.log('inside the lowercase session');
            return res.status(400).json({
                success: false,
                message: 'Coupon code has already been applied.',
            });
        }

        const coupon = await couponcollection.findOne({ 
            couponcode: { $regex: new RegExp(couponcode, 'i') } });
        console.log(coupon && coupon.expiredate > currentDate)

        if (coupon && coupon.expiredate > currentDate && couponcode.toLowerCase() === coupon.couponcode.toLowerCase()) {
            console.log('here if')
            const discountAmount = coupon.discount;
            const amountLimit = coupon.purchaseamount            ;
            req.session.coupon = coupon.coupencode;

            return res.json({ success: true, discount: discountAmount, amount: amountLimit });
        } else {
            console.log('inside the expire');
            return res.status(400).json({
              
                success: false,
                message: 'Invalid coupon code or expired.',
            });
        }
    } catch (error) {
        console.error('Error in coupencheck:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during coupon validation.',
        });
    }
};


module.exports = {
    CouponPage,
    AddCoupon,
    AddCouponPost,
    ShowCoupon,
    BackButton,
    coupencheck
}
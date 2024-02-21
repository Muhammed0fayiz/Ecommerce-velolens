const express = require('express');
const router = express.Router();
const usercollection = require('../models/users')
const productcollection = require('../models/product')
const categorycollection = require('../models/category')
const ordercollection = require('../models/order')
const addresscollection = require('../models/address')
const cartcollection = require('../models/cart');
const wishlistcollection=require('../models/wishlist')

// wishlist page
const Wishlist=async(req,res)=>{
try {
  const userId = req.session.user;
  const wishlist = await wishlistcollection.find({ userid: userId });

  res.render('user/wishlist',{wishlist})
}
catch (error) {
  console.log(error)
  
}}
  
// add wishlist
const AddToWishlist=async(req,res)=>{
  try {
    const productId = req.params.id;
    const userId = req.session.user;
    const product = await productcollection.findById(productId).populate('Category')
    const existingWishItem = await wishlistcollection.findOne({ userid: userId, productid: productId });

    if (existingWishItem) {
      await wishlistcollection.findOneAndDelete({ userid: userId, productid: productId });
      console.log('Item removed from wishlist');
      console.log('Quantity incremented');
    } else {
      const data = {
        userid: userId,
        productid: product._id,
        productname: product.productName,
        Category: product.Category.category,
        price: product.Price,
        rating:product.Rating,
        model:product.Model,

        image: product.image[0]
      };

      await wishlistcollection.create(data);
    }

    res.redirect('/shop');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

const WishlistRemove= async(req,res)=>{
 try {
  const id=req.params.id
  await wishlistcollection.findByIdAndDelete(id)
  res.redirect('/wishlist/wishlistpage')
}
  catch (error) {
  console.log(error)
 }}


module.exports = {
 Wishlist,
 AddToWishlist,
 WishlistRemove
};

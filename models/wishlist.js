const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types; // Add this line to import ObjectId

const WishlistSchema = new mongoose.Schema({
    
    userid: {
        type: ObjectId 
    },
    productid:{
        type:ObjectId
    },

    productname: {
        type: String
       
    },
    Category:{
        type:String,
       
    },
    price: {
        type: Number
       
    },
    rating:{
        type:Number,
    },
   model:{
    type:String,
   },
    image:[String]

})

const Wishlist = mongoose.model('wishlist', WishlistSchema);
module.exports = Wishlist;

const { ObjectId } = require('mongodb');
const mongoose = require('mongoose')

const cartschema = new mongoose.Schema({
    
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
    quantity: {
        type: Number
        
    },
    image:[String]

})
const cart = mongoose.model('cartdetials', cartschema)
module.exports = cart
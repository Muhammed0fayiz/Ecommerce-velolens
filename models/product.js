const mongoose=require('mongoose')
const category=require('../models/category')
const ProductSchema = new mongoose.Schema({
    productName:{
        type:String,
        require:true
    },
    Category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: category,
    },
   Price:{
        type:Number,
        require:true
    },
    Rating:{
        type:Number,
        require:true
    },
    Model:{
        type:String,
        require:true
    },
    Stock:{
        type:Number,
        require:true
    },
    islisted: {
        type: Boolean,
        default:true
    },
    Description:{
        type:String,
        require:true
    },
    image:[String]
})

const Product = mongoose.model('products', ProductSchema);
module.exports=Product
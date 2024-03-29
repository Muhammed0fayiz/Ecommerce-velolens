const { ObjectId } = require('mongodb')
const mongoose=require('mongoose')
const orderSchema = new mongoose.Schema({
    userid: {
        type: ObjectId
    },
    username: {
        type: String
    },
    productcollection: [
        {
            productid: {
                type: ObjectId
            },
            productName: {
                type: String,
                required: true
            },
            Category:{
                type:String
            },
            price: {
                type: Number,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            status:{
                type:String,
                required:true
            },
          
           
        }
    ],
   
    address: {
        type: Object
    },
    paymentmode: {
        type: String
    },
    totalPrice:{
        type:Number
    },
  
   orderdate:{
        type:Date,
        required:true
   },
   discount: {
    type:Number,
        default:0
},
invdiscount:{
    type:Number,
    default:0
}
    
});

const order=mongoose.model('orders',orderSchema)
module.exports= order
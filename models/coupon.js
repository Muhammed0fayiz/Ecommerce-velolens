const mongoose=require('mongoose')

const coupenschema=new mongoose.Schema({
    couponcode:{
        type:String
    },
    discount:{
        type:Number
    },
    expiredate:{
        type:Date
    },
    purchaseamount:{
        type:Number
    }
 
})
const coupenstructure=new mongoose.model('coupens',coupenschema)

module.exports=coupenstructure
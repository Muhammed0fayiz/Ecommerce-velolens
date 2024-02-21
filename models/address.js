
const { ObjectId } = require('mongodb')
const mongoose=require('mongoose')
const addressSchema = new mongoose.Schema({
    userid:{
        type:ObjectId
    },
    firstname: {
        type: String,

    },
    secondname: {
        type: String,

    },
    phonenumber: {
        type: Number,

    },
    pincode: {
        type: Number
    },
    city: {
        type: String
    },
    state: {
        type: String
    },
    housename:{
        type:String
    }
})

const address= mongoose.model('address', addressSchema);
module.exports =address
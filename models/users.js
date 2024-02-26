const mongoose = require('mongoose')
const loginschema = new mongoose.Schema({
    username: {
        type: String,
   
    },
    email: {
        type: String,
   
    },
    password: {
        type: String,
    },
    isblocked: {
        type: Boolean,
        default:false
    },
    image:[String],
    wallet:{
        type:Number,
        default:0
    },
    isAdmin:{
        type: Boolean,
        default:false
    },
    Wallethistory: [
        {
            amount: {
                type: Number
            },
            Date: {
                    type:Date,
            },
            Status:{
                type:String,
            },
        
           
        }
    ],
});

const users = mongoose.model('signups', loginschema);

module.exports = users;
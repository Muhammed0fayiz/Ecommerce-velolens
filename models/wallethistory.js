const { ObjectId } = require('mongodb')

const mongoose = require("mongoose");


const walletSchema = new mongoose.Schema({
    userid: {
        type: ObjectId
    },
    date: {
        type: Date,
    },
    amount: {
        type: Number,
    },
    creditordebit: {
        type: String,
},
})
// Creating Model
const Wallet = new mongoose.model("walletCollection", walletSchema);

module.exports=Wallet;

const { ObjectId } = require('mongodb')
const mongoose=require('mongoose')
const profile=new mongoose.Schema({
    userid:{
        type:ObjectId
    },
    profilepic:{
        type:String
    }
}) 
const profilecollection=mongoose.model('profileaddress',profile)
module.exports=profilecollection;
const mongoose=require('mongoose')
const CategorySchema = new mongoose.Schema({
    category:{
        type:String,
        require:true
    }
})

const category =  mongoose.model('category',CategorySchema);
module.exports=category
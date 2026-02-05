const mongoose = require('mongoose');

const FormSchema = new mongoose.Schema({
    user:{
        type : mongoose.Schema.Types.ObjectId,
        ref :"User",
        required : true,
    },
    category :{
        type : String,
        required : true,
    },
    visitorsName :{
        type : String,
        required : true,
    },
    visitorsEmail :{
        type : String,
    },
    visitorsPhone:{
        type : String,
    }
},{timestamps : true})


module.exports = mongoose.model('Form',FormSchema);
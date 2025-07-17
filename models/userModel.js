const mongoose = require("mongoose");

// Define schema
const userSchema = new mongoose.Schema({
  yourname: String,
    yourphone:String,
    youremail:{type:String,required:true,index:true,unique:true},
    youradd:String,
    busadd:String,
    siteadd:String,
    area:String,
    floor:String,
    city:String,
    state:String,
    pin:String,
    doingSince:String, // New dropdown field
    ownershipStatus: String, // New radio button field
    status: { type: Number, default: 0 }, // 0 = Pending, 1 = Accepted, -1 = Rejected, 2 = Franchise
    // uid:{type:String,required:true,index:true,unique:true},
    // pwd:String,
    // dos:{type:Date,default:Date.now},
    // picpath:String
}, {
  versionKey: false, // to avoid __v field
});

// Export model directly
module.exports = mongoose.model("application", userSchema);

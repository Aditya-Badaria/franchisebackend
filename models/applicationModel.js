// models/applicationModel.js
const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
    yourname: String,
    yourphone: String,
    youremail: { type: String, required: true, unique: true },
    youradd: String,
    busadd: String,
    siteadd: String,
    area: String,
    floor: String,
    city: String,
    state: String,
    pin: String,
    doingSince: String,
    ownershipStatus: String,
    status: { type: Number, default: 0 }
}, { versionKey: false });

const Application = mongoose.model("Application", applicationSchema, "applications");
module.exports = Application;
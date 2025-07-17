const mongoose = require("mongoose");

const idPwdSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user"
    }
}, { timestamps: true });

const IdPwdModel = mongoose.model("idpwd_collection", idPwdSchema);

module.exports = IdPwdModel;

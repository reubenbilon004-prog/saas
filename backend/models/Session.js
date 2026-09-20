const mongoose = require("mongoose");

const seessionSchma = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    refreshToken:{
        type:String,
        required:true
    },
    expiresAt:{
        type: Date,
        required: true
    }

},
{
    timestamps:true
});

const Session = mongoose.model("Session",seessionSchma);
module.exports = Session;
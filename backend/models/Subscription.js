const mongoose = require("mongoose");
const subscriptionScehma = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true

    },
    plan:{
        type:String,
        enum:["free","pro"],
        defualt: "free" 
    },
    status:{
        type: String,
        emum: ["active","expired","cancelled"],
        default:"active"
    },
    startDate:{
        type: Date,
        default: Date.now
    },
    expiryDate:{
        type: Date
    }
},
    {
        timestamps: true
    }
);

const Subscription = new mongoose.model("Subsciption",subscriptionScehma);
module.exports = Subscription;
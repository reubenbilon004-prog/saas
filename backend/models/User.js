const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,

    },
    role:{
        type:String,
        enum:["user","admin"],
        default:"user"
    },
    googleId:{
        type:String
    },
    isSuspended:{
        type: Boolean,
        default: false
    },
    isVerified:{
        type: Boolean,
        default:false
    },
    emailVerificationToken:{
        type:String
    },
    emailVerificationExpiers:{
        type: Date
    },
    passwordResetToken:{
        type: String
    },
    passwordResetExpires:{
        type: Date
    }
},
{
    timestamps: true
}
);
const User = mongoose.model("User",userSchema);
module.exports = User;
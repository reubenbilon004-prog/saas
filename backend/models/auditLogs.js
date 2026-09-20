const mongoose = require("mongoose");
const auditLog = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
    action:{
        type:String,
        required:true
    }
},
{
    timestamps: true
});

const audit = mongoose.model("auditLog",auditLog);
exports.model = audit;
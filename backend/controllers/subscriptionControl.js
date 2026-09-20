const Subsciption = require("../models/Subscription");
const audit = require("../models/auditLogs");

const getMySub = async(req,res)=>{
    try{
        const subscription = await Subsciption.findOne({
            userId: req.user.userId
        });
        if(!subscription){
            return res.status(400).json({
                messsage: "Subscription not found"
            });
        }
        res.status(200).json({
            subscription
        });


    }catch(error){
        console.log(error)
        res.status(500).json({
            message: "Server error"
        });
    }
};
const upgradeToPro = async(req,res)=>{
    try{
        const subscription = await Subsciption.findOne({
            userId: req.user.userId
        });
        if(!subscription){
            return res.status(404).json({
                message: "Subscription not found"
            });
        }
        subscription.plan = "pro";
        subscription.status = "active";

        subscription.startDate = new Date();
        subscription.expiryDate = new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
        );
        await subscription.save();

        auditLog.create({
            userId: req.user.userId,
            action: "SUBSCRIPTION_UPGRADE"
        });

        res.status(200).json({
        
            message: "Subscription upgraded to pro",
            subscription
        });

    }catch(error){
        console.log(error)

        res.status(500).json({
            message: "Server error"
        });

    }
};
module.exports = {getMySub,upgradeToPro};
const Subsciption = require("../models/Subscription");

const subscriptionMiddle = async(req,res,next)=>{
    try{
        const subscription = await Subsciption.findOne({
            userId: req.user.userId
        });

        if(!subscription){
            return res.status(404).json({
                message: "Subscription not found"
            });
        }

        if(subscription.expiryDate && subscription.expiryDate < Date.now()){
            subscription.status = "expired";

            await subscription.save();

            return res.status(403).json({
                message: "Subscription expired"
            });
        }
        if(subscription.status !== "active"){
            res.status(403).json({
                message: "Subscription is not active"
            });
        }
        if(subscription.plan!=="pro"){
            return res.status(403).json({
                message: "Pro subscription required"
            });
        }
        req.subscription = subscription;
        next();
    }catch(error){
        console.log(error);
        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = subscriptionMiddle;
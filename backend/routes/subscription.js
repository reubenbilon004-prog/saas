const express = require("express");
const router = express.Router();

const authMiddle = require("../middleware/authMiddle");
const {getMySub, upgradeToPro} = require("../controllers/subscriptionControl");
const subscriptionMiddle = require("../middleware/subscriptionMiddle");

router.get("/me",authMiddle,getMySub);
router.post("/upgrade-plan",authMiddle,upgradeToPro);

router.get("/pro-test",authMiddle,subscriptionMiddle,(req,res)=>{
    res.status(200).json({
        message:"You have access to pro features",
        plan: req.subscription.plan
    });
});

module.exports =router;

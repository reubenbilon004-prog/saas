const User = require("../models/User");
const getProfile = async (req,res)=>{
    try{
        const user = await User.findById(req.user.userId)
        .select("-password");
        if(!user){
            return res.status(404).json({
                message:"User not found"
            });
        }
        res.status(200).json({
            user
        });
    }catch(error){
        res.status(500).json({
            message: "Server error"
        });
    }
};

const getAllusers = async(req,res)=>{
    try{
        const users = await User.find().select("-password");

        res.status(200).json({
            users
        });
    }catch(error){
        res.status(500).json({
            message: "Server Error"
        });
    }
};

const userSuspen = async (req,res)=>{
    try{
        const {userId}  = req.params;
        
        const user = await User.findByIdAndUpdate(
            userId,
            {isSuspended : true},
            {returnDocument: "after"}
        ).select("-password");
        if(!user){
            return res.status(404).json({
                message: "User not found"
            });
        }
        res.status(200).json({
            message: "User suspended"
        });
    }catch(error){
        res.status(500).json({
            message: "Server error"
        });
    }
};
const unSuspen = async(req,res)=>{
    try{
        const {userId} = req.params;

        const user = await User.findByIdAndUpdate(
            userId,
            {isSuspended : false},
            {returnDocument: "after"}
        ).select("-password");

        if(!user){
            return res.status(404).json({
                message: "User not found"
            });
        }
        res.status(200).json({
            message: "User unsuspended",
            user
        });
    }catch(error){
        res.status(500).json({
            message: "Server error"
        });
    }
};

const deleteUser = async (req,res)=>{
    try{
        const {userId} = req.params;
        const user = await User.findByIdAndDelete(userId);
        if(!user){
            return res.status(404).json({
                message: "User not found"
            });
        }
        res.status(200).json({
            message: "User deleted successfuly"
        });
    }catch(error){
        res.status(500).json({})
        message: "Server error"
    }
};

module.exports = {getProfile , getAllusers,userSuspen,unSuspen,deleteUser};
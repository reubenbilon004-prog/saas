const roleMiddle = (requiredRoll)=>{
    return (req,res,next)=>{
        if(req.user.role !=requiredRoll){
            return res.status(403).json({
                message: "Access denied"
            });
        }
        next();
    };
};
module.exports = roleMiddle;
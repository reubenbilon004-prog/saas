const jwt = require("jsonwebtoken");

const authMiddle = (req,res,next)=>{
    const authHeader = req.headers.authorization;

    if(!authHeader){
        return res.status(401).json({
            message: "Access token required"
        });
    }
    const token = authHeader.split(" ")[1];
    try{
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
            );
            req.user = decoded;
            next();
        }catch(error){
            console.log("Jwt error",error.name);
            console.log("Jwt Message",error.message);

            return res.status(401).json({
            message: "Invalid or expired access token"
        });

        }
    };

    module.exports = authMiddle;

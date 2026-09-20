const { google } = require("googleapis");
const jwt = require("jsonwebtoken");
const Subsciption = require("../models/Subscription");
const User = require("../models/User");
const Session = require("../models/Session");

//oauth2Client
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "http://localhost:3000/api/auth/google/callback"

);

const googleLogin = (req,res)=>{
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope:[
            "openid",
            "profile",
            "email"
        ]
    });
    res.redirect(authUrl);
};
// Verify the user's Google authentication and get their Google account details
const googleCallback = async (req,res) =>{
    try{
        const {code } = req.query;
        const {tokens} = await oauth2Client.getToken(code);

        const ticket = await oauth2Client.verifyIdToken({
            idToken: tokens.id_token,
            audience:process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const {sub,name,email} = payload;

        let user = await User.findOne({email});
        if(!user){
            user = await User.create({
                name,
                email,
                googleId: sub,
                isVerified: true
            });
        }
        const existingSubscription = await Subsciption.findOne({
            userId:user._id
        });
        if(!existingSubscription){
        await Subsciption.create({
            userId:user._id,
            plan: "free",
            status: "active"
        });
    }
        const accessToken = jwt.sign(
            {
            userId:user._id,
            role:user.role
        },
        process.env.JWT_SECRET,
        {expiresIn: "15m"}
        );
        const refreshToken = jwt.sign({
            userId: user._id
        },
        process.env.REFRESH_SECRET,
        {expiresIn: "2d"}
        );
        await Session.create({
            userId: user._id,
            refreshToken:refreshToken,
            expiresAt: new Date(
                Date.now() + 2 * 24 * 60 * 60 * 1000
            )
        });
        res.cookie("refreshToken",refreshToken,{
            httpOnly:true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });
        res.redirect(
            `http://localhost:5173/dashboard?token=${accessToken}`
        );
    }catch(error){
        console.log(error);

        res.status(500).json({
            message: "Google authenitcaton failed"
        });
    }
};
module.exports = { googleLogin,googleCallback};

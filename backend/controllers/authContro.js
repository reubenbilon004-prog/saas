const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const Session = require("../models/Session");
const Subsciption = require("../models/Subscription")

const transpoter = nodemailer.createTransport({
    service: "gmail",
    auth:{
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const register = async (req,res)=>{
    try{
        const {name,email,password}= req.body;

        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                message:"Invalid Email already exist!"
            });
        }

        const hashPass = await bcrypt.hash(password,10);
        const user = await User.create({
            name,
            email,
            password: hashPass
        });
        await Subsciption.create({
            userId: user._id,
            plan: "free",
            status: "active"
        });
        const verificationToken = crypto.randomBytes(32).toString("hex");
        user.emailVerificationToken = verificationToken;
        user.emailVerificationExpires = Date.now() + 15 * 60 *1000;
        await user.save();

        const verificationLink = 
        `http://localhost:3000/api/auth/verify-email?token=${verificationToken}`;

        await transpoter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Verify your email",
            html: `
            <h2>Email Verification</h2>
            <p>Click the link below to verify your email:</p>
            <a href="${verificationLink}">Verify Email</a>
            <p>This link expires in 15 minutes.</p>
            `
        });

        res.status(201).json({
            message: "User registred successfuly,Please check your email to verify your account",
            userId: user._id
        });
    }catch(error){
        console.log(error);
        res.status(500).json({
            message:"Server error"
        });
    }
};

const verifyEmail = async(req,res)=>{
    try{
        const {token} = req.query;
        if(!token){
            return res.status(400).json({
                message: "Verification token required"
            });
        }
        const user = await User.findOne({
            emailVerificationToken: token
        });
        if(!user){
            return res.status(400).json({
                message: "Invalid verification token"
            });
        }
        if(user.emailVerificationExpires < Date.now()){
            return res.status(400).json({
                message: "Verification token expired"
            });
        }
        user.isVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;

        await user.save();

        res.status(200).json({
            message:"Email verified successfully"
        });
    }catch(error){
        res.status(500).json({
            message: "Server error"
        });
    }
};

const forgotPassword = async(req,res)=>{
    try{
        const {email} = req.body;

        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({
                message: "User not found"
            });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");

        user.passwordResetToken = resetToken;
        user.passwordResetExpires = Date.now() + 15 * 60 * 1000;

        await user.save();

        const resetLink = 
            `http://localhost:3000/api/auth/reset-password?token=${resetToken}`;

        await transpoter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Reset your password",
            html: `
                <h2>Password Reset<h2>
                <p>Click the link bellow to reset your password:</p>
                <a href="${resetLink}">Reset password</a>
                <p>This link expires in 15 minutes.</p>
                `
        });
        return res.status(200).json({
            message: "Password reset link sent to your email"
        });
    }catch(error){
        console.log(error)
        res.status(500).json({
            message:"Server error"
        });
    }
};

const resetPassword = async(req,res)=>{
    try{
        const {token} = req.query;
        const {password} = req.body;

        if(!token){
            return res.status(400).json({
                message: "Reset token required"
            });
        }
        
        const user = await User.findOne({
            passwordResetToken: token
        });
        if(!user){
            return res.status(400).json({
                message:"Invalid reset token"
            });

        }
        if(user.passwordResetExpires < Date.now()){
            return res.status(400).json({
                message: "Reset token expired"
            });
        }
        const hashPass = await bcrypt.hash(password,10);


        user.password = hashPass;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        

        await user.save();

        res.status(200).json({
            message: "Password reset successfully"
        })

    }catch(error){
        console.log(error)
        return res.status(500).json({
            message: "Server error"
        });
    }
};

const login =async (req,res)=>{
    try{
        const {email,password} = req.body;

        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({
                message: "Invalid user or password"
            });
        }
        const passmatch = await bcrypt.compare(password,user.password);
        if(!passmatch){
            return res.status(400).json({
                message: "Invalid passowrd"
            });
        }
        if(!user.isVerified){
            return res.status(403).json({
                message: "Please verify your email before loggin in"
            });
        }
        const accessToken = jwt.sign(
            {
            userId: user._id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {expiresIn: "15m"}
        );

        const refreshToken = jwt.sign(
            {
                userId: user._id
            },
            process.env.REFRESH_SECRET,
            {
                expiresIn: "2d"
            }
        );
        await Session.create({
            userId:user._id,
            refreshToken:refreshToken,
            expiresAt:new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        });
        res.cookie("refreshToken", refreshToken,{
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });
        res.status(200).json({
            message: "Login successful",
            accessToken
        });
    }catch(error){
        res.status(500).json({
            message: "server error"
        });
    }
};

const refresh = async(req,res)=>{
    try{
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken){
            return res.status(401).json({
                message:"Refresh token required"
            });
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_SECRET
        );
        // Find the refresh token in the Session collection
        const session = await Session.findOne({
            refreshToken:refreshToken
        });
        if(!session){
            return res.status(400).json({
                message: "Session not found"
            });
        }
        if(session.expiresAt < Date.now()){
            return res.status(401).json({
                message: "Session expired"
            });
        }
        const user = await User.findOne(session.userId);
        if(!user){
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Create a new refresh token for this session
        const newRefreshToken = jwt.sign({
            userId: session.userId
        },
        process.env.REFRESH_SECRET,
        {expiresIn: "2d"}
        );
        // Replace the old refresh token with the new one

        session.refreshToken = newRefreshToken;
        // Reset the session expiry time

        session.expiresAt = new Date(
            Date.now() + 2 * 24 * 60 * 60 * 1000
        );
        await session.save();
        // Replace the old refresh token cookie with the new one
        res.cookie("refreshToken",newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "Production",
            sameSite: "strict"
        });

        const newAccessToken = jwt.sign(
            { 
                userId: session.userId,
                role: user.role

            },
            process.env.JWT_SECRET,
            {expiresIn: "1h"}
        );
        res.status(200).json({
            accessToken: newAccessToken
        });
    }catch(error){
        res.status(401).json({
            message: "Invalid or expired refresh token"
        });
    }
};

const logout = async(req,res)=>{
    try{
        const refreshToken = req.cookies.refreshToken;

        if(refreshToken){
             // Delete the session associated with this refresh token
            await Session.deleteOne({
                refreshToken: refreshToken
            });
        }
        // Remove the refresh token from the browser
        res.clearCookie("refreshToken");
        return res.status(200).json({
            message:"Logout successful"
        });
    }catch(error){
        console.log(error)

        return res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {register,
     login,
      refresh,
      verifyEmail,
      forgotPassword,
      resetPassword,
      logout};

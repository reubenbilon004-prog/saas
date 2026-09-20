const express = require("express");
const router = express.Router();

const {register,
    login,
    refresh,
    verifyEmail,
    forgotPassword,
    resetPassword,
    logout} = require("../controllers/authContro");

router.post("/register",register);

router.post("/login",login);

router.post("/refresh",refresh);

router.get("/verify-email",verifyEmail);

router.post("/forgot-password",forgotPassword);

router.post("/reset-password",resetPassword);

router.post("/logout",logout);


module.exports = router;
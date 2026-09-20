const express = require("express");
const router = express.Router();

const authMiddle = require("../middleware/authMiddle");
const {getProfile} = require("../controllers/userControlle");



router.get("/profile",authMiddle,getProfile);


module.exports = router;
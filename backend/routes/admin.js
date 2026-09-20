
const express = require("express");
const router = express.Router();


const roleMiddle = require("../middleware/roleMiddle");
const authMiddle = require("../middleware/authMiddle");
const {getAllusers,
    userSuspen,
    unSuspen,deleteUser} = require("../controllers/userControlle");

router.get("/test",
    authMiddle,roleMiddle("admin"),
    (req,res)=>{
    return res.status(200)
    .json({
        message: "Welcome admin"
    });
});
router.get("/getAllusers",
    authMiddle,
    roleMiddle("admin"),
    getAllusers);

router.patch("/users/:userId/patch",
    authMiddle,
    roleMiddle("admin"),
    userSuspen);

router.patch("/users/:userId/update",
    authMiddle,
    roleMiddle("admin"),
    unSuspen);

router.delete("/users/:userId/delete",
    authMiddle,
    roleMiddle("admin"),
    deleteUser);

module.exports = router;
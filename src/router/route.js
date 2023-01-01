const express=require('express')
const router=express.Router()
let{creatuser,login,getuser,updateuser}=require("../controler/user")
let{authentication,autherization, admin}=require("../middelwear/auth")


router.post("/register",creatuser)
router.post('/login',login)
router.get("/user/:userId",authentication,admin,getuser)
router.put("/user/:userId",authentication,autherization,updateuser)



router.all("/*", function (req, res) {
    res.status(404).send({ status: false, message: "Incorrect URL" });
})



module.exports=router
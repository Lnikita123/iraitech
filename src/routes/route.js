const express=require('express')
const router=express.Router()
const userController= require("../controllers/userController")



const {authentication}=require('../middleware/auth')

router.post('/signup',userController.signup)
router.post('/login',userController.login)
router.get('/user',userController.getAllUserProfile)
router.get('/user/:userId',authentication,userController.getProfile)
router.put('/user/:userId',authentication,userController.updateUser)

module.exports=router
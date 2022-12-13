const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const userModel = require('../models/userModel')
const userProfileModel = require('../models/userProfileModel')
const { uploadFile } = require('../util/aws_sdk')
const validator = require('../util/validatons')

const signup = async function (req, res) {
    try {
        let files = req.files;
        let userDetails = req.body
        let { name, email, password } = userDetails

        if (!validator.isValidRequestBody(userDetails)) {
            return res.status(400).send({ status: false, message: "please provide valid user Details" })
        }

        if (!validator.isValid(name)) {
            return res.status(400).send({ status: false, message: " name is required" })
        }

        if (!validator.isValid(email)) {
            return res.status(400).send({ status: false, message: "Email is required" })
        }

        if (!validator.isValidEmail(userDetails.email))
            return res.status(400).send({ status: false, message: "Invalid Email id." })

        const checkEmail = await userModel.findOne({ email })

        if (checkEmail) {
            return res.status(400).send({ status: false, message: `emailId is already Exists.` })
        }

        if (!files.length) {
            return res.status(400).send({ status: false, message: "Profile Image is required" })
        }

        if (!validator.isValid(password)) {
            return res.status(400).send({ status: false, message: "password is required" })
        }


        let userImage = await uploadFile(files[0]);

        const hashedPassword = await bcrypt.hash(password, 10)

        userDetails.profileImage = userImage
        userDetails.password = hashedPassword

        const saveUserInDb = await userModel.create(userDetails);
        await userProfileModel.create({ user: saveUserInDb._id })

        return res.status(201).send({ status: true, message: "user creationsuccessfully", data: saveUserInDb });

    } catch (err) {

        return res.status(500).send({ status: false, error: err.message })

    }

}

//************************************************************************Login Api********************************************** //

const login = async function (req, res) {

    try {

        const loginData = req.body;

        const { email, password } = loginData;

        if (!validator.isValidRequestBody(loginData)) {
            return res.status(400).send({ status: false, message: 'Please provide login details' })
        }
        if (!validator.isValid(email)) {
            return res.status(400).send({ status: false, message: 'Email-Id is required' })
        }
        if (!validator.isValid(password)) {
            return res.status(400).send({ status: false, message: 'Password is required' })
        }
        const userData = await userModel.findOne({ email });

        if (!userData) {
            return res.status(401).send({ status: false, message: `Login failed` });
        }

        const checkPassword = await bcrypt.compare(password, userData.password)

        if (!checkPassword) return res.status(401).send({ status: false, message: ` password is incorrect.` });
        let userId=userData._id
        const token = jwt.sign({
            userId: userId._id,
            email: userId._email
            
            }, "iraitechProject", { expiresIn: "5hrs" }
            
            );
      
        return res.status(200).send({ status: true, message: "LogIn Successful!!", data: {userId:userId,Token:token} });

    } catch (err) {
        return res.status(500).send({ status: false, error: err.message });
    }
}




//**************************************************get user By Id ************************************************************//

const getProfile = async function (req, res) {
    try {
        const userId = req.params.userId
        const userIdFromToken = req.userId

        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Invalid userId" })
        }

        const findUserDetails = await userModel.findById(userId)
        if (!findUserDetails) {
            return res.status(404).send({ status: false, message: "User Not Found" })
        }

        if (findUserDetails._id.toString() != userIdFromToken) {
            return res.status(403).send({ status: false, message: "unAuthorize excessed" });
        }

        return res.status(200).send({ status: true, message: "Profile Fetched Successfully", data: findUserDetails })

    } catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}

//******************************************get All user Api*********************************************************** //

const getAllUserProfile = async function (req, res) {
    try {
        const findUserDetails = await userModel.find()

        if (!findUserDetails) {
            return res.status(404).send({ status: false, message: "No Data Found" })
        }

        return res.status(200).send({ status: true, message: "Profile Fetched Successfully", data: findUserDetails })

    } catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}

//******************************************************update User******************************************************** */

const updateUser = async function (req, res) {
    try {
        let files = req.files
        let userDetails = req.body
        let userId = req.params.userId
        let userIdFromToken = req.userId

        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Invalid UserId" })
        }
        const findUserData = await userModel.findById(userId)
        if (!findUserData) {
            return res.status(404).send({ status: false, message: "user not found" })
        }
        if (findUserData._id.toString() != userIdFromToken) {
            return res.status(403).send({ status: false, message: "unAuthorized" })
        }

        let { name,email,password} = userDetails

        if (!validator.isValidRequestBody(userDetails)) {
            return res.status(400).send({ status: false, message: "Please provide user's details." })
        }
        if (!validator.validString(name)) {
            return res.status(400).send({ status: false, message: ' name is Required' })
        }
        if (!validator.validString(email)) {
            return res.status(400).send({ status: false, message: 'email is Required' })
        }
        if (email) {
            if (!validator.isValidEmail(email))
                return res.status(400).send({ status: false, message: "Invalid Email id." })

            const checkEmailFromDb = await userModel.findOne({ email: userDetails.email })

            if (checkEmailFromDb)
                return res.status(404).send({ status: false, message: `emailId is Exists.` })
        }


        if (!validator.validString(password)) {
            return res.status(400).send({ status: false, message: 'password is Required' })
        }

        if (password) {

            if (!(password.length >= 8 && password.length <= 15)) {
                return res.status(400).send({ status: false, message: "Password should be Valid min 8 and max 15 " })
            }
            var hashedPassword = await bcrypt.hash(password, 10)

        }

        if (files&&files.length) {
            var userImage = await uploadFile(files[0])
        }

        let updatedData={ name:name, email:email, password:hashedPassword,profileImage:userImage}

            let updateProfileDetails = await userModel.findOneAndUpdate( { _id: userId },updatedData, { new: true })
        return res.status(200).send({ status: true, msg: "User Update Successful!!", data: updateProfileDetails })

    } catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}
module.exports = { signup, login, getProfile, getAllUserProfile, updateUser }
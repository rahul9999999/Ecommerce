
const ErrorHandler= require("../utils/errorhandler");
const catchAsyncError = require("../middleware/catchAsyncErrors");
const User = require("../models/userModels");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const cloudinary = require("cloudinary")


exports.createUser = catchAsyncError(async (req, res) => {
    const cloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 400,
        crop: "scale",
        height:450,
        quality:100

    })
    const { name, email, password } = req.body;
    const user = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: cloud.public_id,
            url: cloud.secure_url

        }
    })

    sendToken(201, user, res)

})
exports.login = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password)
        return next(new ErrorHandler("Plaese Enter Email or Password", 400));

    const user = await User.findOne({ email }).select("+password")

    if (!user)
        return next(new ErrorHandler("Invalid Email or Password", 400));

    const isMatchPassword = await user.comparePassword(password)

    if (!isMatchPassword)
        return next(new ErrorHandler("Invalid Email or Password", 400))

    sendToken(200, user, res)

})

exports.logout = catchAsyncError(async (req, res, next) => {
    res.cookie("token", null, {
        httpOnly: true,
        expires: new Date(Date.now())
    })
    res.status(200).json({
        success: true,
        message: "Logout Successfully"

    })

})

exports.forgotPassword = catchAsyncError(async (req, res, next) => {
    const { email } = req.body;
    const user = await User.findOne({ email })
    if (!user)
        return next(new ErrorHandler("User not found", 404))

    const resetToken = user.getResetPasswordToken()
    await user.save({ validateBeforeSave: false })

    const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\n if you have not requested this email then, ignore it `

    try {
        await sendEmail({
            email: user.email,
            subject: `Ecommerce Password Recovery`,
            message

        })

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`
        })



    } catch (error) {
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined

        await user.save({ validateBeforeSave: false })

        return next(new ErrorHandler(error.message, 500))

    }





})
exports.resetPassword = catchAsyncError(async (req, res, next) => {
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }

    })
    if (!user)
        return next(new ErrorHandler("Reset password token invalid or has been expired", 400))

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password dosenot matched", 400))
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false })

    sendToken(200, user, res)




})
exports.getUserDetails = async (req, res, next) => {
    const user = await User.findById(req.user.id)

    if (!user)
        return next(new ErrorHandler("User not found", 404))

    res.status(200).json({
        success: true,
        user
    })
}
exports.updatePassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password")

    if (!user)
        return next(new ErrorHandler("User not found", 404))

    const isMatchPassword = user.comparePassword(req.body.oldPassword)
    if (!isMatchPassword)
        return next(new ErrorHandler("Old Password dosenot matched"), 400)

    if (req.body.newPassword !== req.body.confirmPassword)
        return next(new ErrorHandler("Password Dosenot Matched"), 400)

    user.password = req.body.newPassword

    await user.save({ validateBeforeSave: false })

    sendToken(200, user, res)

})

exports.updateProfile = catchAsyncError(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email
    }

    if (req.body.avatar !== "") {
        const user = await User.findById(req.user.id)
        const imgId = user.avatar.public_id;
        await cloudinary.v2.uploader.destroy(imgId);

        const cloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: "avatars",
            width: 400,
            crop: "scale",
            height:450,
            quality:100

        })
        newUserData.avatar = {
            public_id: cloud.public_id,
            url: cloud.secure_url
        }

    }
    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        userFindAndModify: false
    })

    res.status(200).json({
        success: true,
        

    })
})

exports.getAllUser = catchAsyncError(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        success: true,
        users
    })
})
exports.getSingleUser = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user)
        return next(new ErrorHandler(`User dosenot exist id:${req.params.id}`))


    res.status(200).json({
        success: true,
        user
    })
})

exports.updateUserRole = catchAsyncError(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }
    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        userFindAndModify: false
    })


    res.status(200).json({
        success: true,
        user
    })
})

exports.deleteUser = catchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.params.id);

    if (!user){
        return next(new ErrorHandler(`User does not exist with id:${req.params.id}`))
    }



    const imgId = user.avatar.public_id;
    await cloudinary.v2.uploader.destroy(imgId);


    await user.deleteOne();



    res.status(200).json({
        success: true,
        message: "User deleted successfully"

    })
})
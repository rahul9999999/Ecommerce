

const catchAsyncError = require("../middleware/catchAsyncErrors");
const ErrorHandler= require("../utils/errorhandler");
const jwt = require("jsonwebtoken");
const User = require("../models/userModels");

 exports.isAuthentication=catchAsyncError(async(req,res,next)=>{
    const {token}=req.cookies;

    if(!token)
    return next(new ErrorHandler("Please Login",401))

    const decode=jwt.verify(token,process.env.JWT_SECRET);


    req.user=await User.findById(decode.id)

    next()

})

exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role))
            return next(new ErrorHandler(`Role: ${req.user.role} is not allowed to access this source`, 403))

        next();
    }

}
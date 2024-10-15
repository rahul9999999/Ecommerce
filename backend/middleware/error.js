const ErrorHandler = require("../utils/errorhandler");

module.exports =(err,req,res,next)=>{
    err.message=err.message || "Internal Server Error"
   err.statusCode=err.statusCode || 500;


   // Mongo Id Error
   if(err.name==="CastError"){
       const message=`Resource not found. Invalid:${err.path}`
       err=new ErrorHandler(message,400)
   }

   if(err.code===11000){
       const message=`Duplicate ${Object.keys(err.keyValue)} Entered`
       err=new ErrorHandler(message,400)

   }

   if(err.name==="jsonWebTokenError"){
       const message=`Json Web Token is Invalid, Try Again`
       err=new ErrorHandler(message,400)

   }
   if(err.name==="TokenExpireError"){
       const message=`Json Web Token is Expired, Try Again`
       err=new ErrorHandler(message,400)

   }

   return res.status(err.statusCode).json({
       success:false,
       message:err.message
   })

   

}
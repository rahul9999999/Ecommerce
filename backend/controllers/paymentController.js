const catchAsyncError = require("../middleware/catchAsyncErrors");
const dotenv =require('dotenv') 


dotenv.config({
    path:"backend/config/config.env"
})

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);


exports.proceedPayment=catchAsyncError(async(req,res,next)=>{
    const payment=await stripe.paymentIntents.create({
        amount:req.body.amount,
        currency:"inr",
        metadata:{
            company:"Ecommerce"
        }

    })
    res.status(200).json({
        success:true,
        client_secret:payment.client_secret
    })
})

exports.sendApiKey=catchAsyncError(async(req,res,next)=>{
    res.status(200).json({
        stripeApiKey:process.env.STRIPE_API_KEY
    })
})
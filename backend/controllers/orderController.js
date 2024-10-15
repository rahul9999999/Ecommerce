
const Order = require("../models/orderModels");
const Product = require("../models/productModels");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncError= require("../middleware/catchAsyncErrors");


exports.newOrder=catchAsyncError(async(req,res)=>{
    const{shippingInfo,
        orderItem,
        paymentInfo,
        itemPrice,
        taxPrice,
        shippingPrice,
        totalPrice}
        =req.body

        const order=await Order.create({
        shippingInfo,
        orderItem,
        paymentInfo,
        itemPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt:Date.now(),
        user:req.user._id

        })

        res.status(200).json({
            success:true,
            order
        })
}) 
exports.getSingleOrder=catchAsyncError(async(req,res,next)=>{
    const order=await Order.findById(req.params.id).populate("user","name email")

    if(!order)
    return next(new ErrorHandler("Order not found with this id",404))

    res.status(200).json({
        success:true,
        order
    })
})
exports.myOrder=catchAsyncError(async(req,res,next)=>{
    const orders=await Order.find({user:req.user._id})

    res.status(200).json({
        success:true,
        orders
    })
})

exports.getAllOrder=catchAsyncError(async(req,res,next)=>{
    const order=await Order.find()

    let totalAmount=0;

    order.forEach((order)=>totalAmount+=order.totalPrice)

    res.status(200).json({
        success:true,
        totalAmount,
        order

    })
})
exports.updateOrder=catchAsyncError(async(req,res,next)=>{
    const order=await Order.findById(req.params.id)

    if(!order)
    return next(new ErrorHandler("Order not found with this id",404))

    if(order.orderStatus==="Diliverd")
    return next(new ErrorHandler("Your order already deliverd",400))

    if(req.body.status==="Shipped"){
        order.orderItem.forEach(async(order)=>{
            await updateStock(order.product,order.quantity)
        })
    }

    order.orderStatus=req.body.status

    if(order.orderStatus==="Delivered"){
        order.delivereAt=Date.now();
    }

    await order.save({validateBeforeSave:false});

    res.status(200).json({
        success:true,
        order

    })
})

async function updateStock(id,quantity){
    const product=await Product.findById(id);
    if(product.stock!=0){
        product.stock-=quantity
    }
    await product.save({validateBeforeSave:false});

}

exports.deleteOrder=catchAsyncError(async(req,res,next)=>{
    const order=await Order.findById(req.params.id)

    if(!order)
    return next(new ErrorHandler("Order not found with this id",404))

    await order.deleteOne()

    res.status(200).json({
        success:true,
       
    })
})
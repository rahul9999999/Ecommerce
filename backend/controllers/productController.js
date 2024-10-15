

const Product = require("../models/productModels");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncError = require("../middleware/catchAsyncErrors");
const Apifeatures = require("../utils/apifeatures");
const cloudinary=require('cloudinary')


exports.createProduct=catchAsyncError(async(req,res)=>{
    let images=[];
    if(typeof req.body.image === "string"){
        images.push(req.body.image)
    }
    else{
        images=req.body.image;
    }

    const imagesLink=[];

    for(let i=0; i<images.length; i++){
        const result=await cloudinary.v2.uploader.upload(images[i],{
            folder:"products",

        })
        imagesLink.push({
            public_id:result.public_id,
            url:result.secure_url

        })

    }

    req.body.image=imagesLink
    req.body.user=req.user.id
    const product= await Product.create(req.body)

    res.status(201).json({
        success:true,
        message:"Created Successfully",
        product
    })

})
exports.getAllProducts=catchAsyncError(async(req,res,next)=>{
    const resultPerPage=8;
    const productCount=await Product.countDocuments();
    const apifeatures=new Apifeatures(Product.find(),req.query)
    .search().filter()

    
    let products=await apifeatures.query.clone()
    let filterProducts=products.length;
    apifeatures.pagination(resultPerPage)
    products=await apifeatures.query;

    res.status(200).json({
        success:true,
        products,
        productCount,
        resultPerPage,
        filterProducts
        

    })
})
exports.getAllAdminProducts=catchAsyncError(async(req,res,next)=>{
    const products=await Product.find();
    res.status(200).json({
        success:true,
        products,
        
    })
})
exports.updateProduct=catchAsyncError(async(req,res,next)=>{
    let product=await Product.findById(req.params.id);

    if(!product)
    return next(new ErrorHandler('Product not found',404))

    let images=[];
    if(typeof req.body.image === "string"){
        images.push(req.body.image)
    }
    else{
        images=req.body.image;
    }
    if(images !== undefined){

        for(let i= 0; i<product.image.length; i++){
            const result=await cloudinary.v2.uploader.destroy(product.image[i].public_id)
    
        }

        const imagesLink=[];

    for(let i=0; i<images.length; i++){
        const result=await cloudinary.v2.uploader.upload(images[i],{
            folder:"products",

        })
        imagesLink.push({
            public_id:result.public_id,
            url:result.secure_url

        })

    }

    req.body.image=imagesLink;

    }


    product=await Product.findByIdAndUpdate(req.params.id,req.body,{new:true,
    runValidators:true,useFindAndModify:false})

    res.status(200).json({
        success:true,
        product
    })
})
exports.deleteProduct=catchAsyncError(async(req,res,next)=>{
    const product=await Product.findById(req.params.id);
    if(!product)
    return next(new ErrorHandler('Product not found',404))

    for(let i= 0; i<product.image.length; i++){
        const result=await cloudinary.v2.uploader.destroy(product.image[i].public_id)

    }
    await product.deleteOne();
    res.status(200).json({
        success:true,
        message:"Product Deleted Successfully"
    })
})

exports.getProductDetails=catchAsyncError(async(req,res,next)=>{
    const product=await Product.findById(req.params.id);
    if(!product)
    return next(new ErrorHandler('Product not found',404))
    res.status(200).json({
        success:true,
        product
        


    })
})

exports.createProductReview=catchAsyncError(async(req,res,next)=>{
    const{rating,comment,productId}=req.body;

    const review={
        user:req.user.id,
        name:req.user.name,
        rating:Number(rating),
        comment
    }
    const product=await Product.findById(productId)

    const isReviewed=product.reviews.find(
        rev=>rev.user.toString()===req.user.id.toString()

    )

    if(isReviewed){
        product.reviews.forEach((rev)=>{
            if(rev.user.toString()===req.user.id.toString())
            (rev.rating=rating),(rev.comment=comment)

        })
        

    }
    else{
        product.reviews.push(review)
        product.numOfReviews=product.reviews.length
            
    }

    let avg=0;

    product.reviews.forEach((rev)=>{
        avg+=rev.rating
    })
    product.ratings=avg/product.reviews.length

    await product.save({validateBeforeSave:false})

    res.status(200).json({
        success:true
    })

    })

exports.getProductReviews=catchAsyncError(async(req,res,next)=>{
    const product=await Product.findById(req.query.productId)

    if(!product)
    return next(new ErrorHandler(`Product not found with id:${req.query.productId}`),404)

    res.status(200).json({
        success:true,
        reviews:product.reviews
    })

})

exports.deleteReview=catchAsyncError(async(req,res,next)=>{
    const product=await Product.findById(req.query.productId)

    if(!product)
    return next(new ErrorHandler(`Product not found with id:${req.query.productId}`),404)

    const reviews=product.reviews.filter((rev)=>
    rev._id.toString() !== req.query.id.toString())

    let avg=0;
    reviews.forEach(rev=>
        {avg+=rev.rating})

    let ratings=0;
    if(reviews.length===0){
        ratings=0
    }
    else{
        const ratings=avg/reviews.length
    }
    const numOfReviews=reviews.length

    await Product.findByIdAndUpdate(req.query.productId,{
        reviews,
        ratings,
        numOfReviews
    },{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })

    

    res.status(200).json({
        success:true

    })



})
        
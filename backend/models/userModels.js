
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please enter the name"],
        maxLength:[30,"Name cannot be exceed then 30 characters" ],
        minLength:[4,"Name Should have more then 4 characters"]
    },
    email:{
        type:String,
        required:[true,"Please enter the email"],
        unique:true,
        validate:[validator.isEmail,"Please enter a valid email id"]

    },
    password:{
        type:String,
        required:[true,"Please enter the password"],
        minLength:[8,"Password Should have more then 8 characters"],
        select:false
    },
    avatar:{
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }

    },
    role:{
        type:String,
        default:"user",
    },
    createAt:{
        type:Date,
        default:Date.now()

    },
    resetPasswordToken:String,
    resetPasswordExpire:Date,
})

userSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        next()
    }
    this.password=await bcrypt.hash(this.password,10)
})
userSchema.methods.getJWT=function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRE,
    })
}
userSchema.methods.getResetPasswordToken=function(){
    const resetToken=crypto.randomBytes(20).toString('hex')
    this.resetPasswordToken=crypto.createHash("sha256").update(resetToken).digest('hex')
    this.resetPasswordExpire=Date.now()+15*60*1000;
    return resetToken;
}
userSchema.methods.comparePassword=async function(password){
    return await bcrypt.compare(password,this.password)

}

module.exports = mongoose.model("User",userSchema)

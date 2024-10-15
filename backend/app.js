
const productRoute = require("./routes/productRoute")
const userRoute = require("./routes/userRoute")
const orderRoute = require("./routes/orderRoute")
const paymentRoute = require("./routes/paymentRoute")

const { json } = require("body-parser")
const express = require("express")
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const errorMiddleware = require("./middleware/error")
const fileUpload = require("express-fileupload")
const dotenv =require('dotenv') 

const app=express();




 dotenv.config({
    path:"backend/config/config.env"
})

// app.use(express.json())
app.use(cookieParser())
app.use(express.json({limit:'5mb'}))
app.use(express.urlencoded({limit:'500mb',extended:true,parameterLimit:100000}))
app.use(fileUpload())

app.use("/api/v1",productRoute);
app.use("/api/v1",userRoute);
app.use("/api/v1",orderRoute);  
app.use("/api/v1",paymentRoute);  

app.use(errorMiddleware)

module.exports = app


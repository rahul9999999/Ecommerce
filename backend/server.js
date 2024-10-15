const app = require("./app");
const cloudinary = require("cloudinary");
const connectToMongo = require("./config/database")

const dotenv =require('dotenv') 

process.on("uncaughtException",(err)=>{
    console.log(`ERROR:${err.message}`)
    console.log("Sutting down the server due uncaught Exception")
    process.exit(1)
})

dotenv.config({
    path:"backend/config/config.env"
})

cloudinary.v2.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET

})

connectToMongo()

const server=app.listen(process.env.PORT,()=>{
    console.log(`listening at port:${process.env.PORT}`)
})
process.on("unhandledRejection",(err)=>{
    console.log(`ERROR:${err.message}`)
    console.log("Sutting down the server due unhandled promise rejection")

    server.close(()=>{
        process.exit(1)
    })

})

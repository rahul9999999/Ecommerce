const mongoose = require("mongoose");

const connectToMongo=()=>{

    mongoose.connect(process.env.MONGO_URI,{
        dbName:"backend"
    }).then(()=>console.log('Data base connected'))
}

module.exports = connectToMongo;
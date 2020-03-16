const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI'); //get the mongoURI from the config.

const connectDB = async () => {
    try{
        await mongoose.connect(db,{
            useNewUrlParser: true,
            useCreateIndex: true
        })

        console.log('mongoDB connected')
    }
    catch(err){
        console.error(err.message)
        //exit process withh failure in case of error connecting to db
        process.exit(1)
    }
}


module.exports = connectDB;
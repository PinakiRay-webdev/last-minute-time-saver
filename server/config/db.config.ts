import mongoose from "mongoose";

const connectDB = async ():Promise<void> =>{
    await mongoose.connect(`mongodb://localhost:27017/last-minute-life-saver}`).then(() =>{
        console.log("Connected to the database")
    }).catch((error):void =>{
        console.log(error);
    })
}

export default connectDB
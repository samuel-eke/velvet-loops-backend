import mongoose from "mongoose";

export const  connectDB = async () =>{

    await mongoose.connect('mongodb+srv://velvetloops:myvelvetloops@velvet-ecommerce.rhom9kv.mongodb.net/?retryWrites=true&w=majority&appName=velvet-ecommerce/velvetloopsstore').then(()=>console.log("DB Connected"));
   
}


// add your mongoDB connection string above.
// Do not use '@' symbol in your databse user's password else it will show an error.
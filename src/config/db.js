import mongoose from "mongoose";

export function connectDB() {
  mongoose
    .connect(process.env.MONGO_URI, { connectTimeoutMS: 10000 })
    .then(() => {
      console.log("Server is connected to DB");
    })
    .catch((err) => {
      console.error("Error in connecting DB ", err);
      process.exit(1);
    });
}

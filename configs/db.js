import "dotenv/config";
import mongoose from "mongoose";

const connectToDatabase = async () => {
  try {
    const connection = await mongoose.connect(process.env.MongoURL);
    console.log("Connected to MongoDB");
    return connection;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    throw error;
  }
};

export default connectToDatabase;

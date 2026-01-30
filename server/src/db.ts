import mongoose from "mongoose";
import { config } from "./config.js";


export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(config.mongoUrl);
        console.log(`MongoDB🍃 Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};
import mongoose from "mongoose";

const { MONGO_URI } = process.env;

export async function connectDB() {
    if (!MONGO_URI) {
        throw new Error("MONGO_URI is not set. Copy .env.example to .env and fill it in.");
    }
    await mongoose.connect(MONGO_URI)
    console.log("MongoDB connected");
}
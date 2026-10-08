import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI

let cached = global.mongoose || { conn: null, promise: null }

if (!global.mongoose) {
    global.mongoose = cached
}

export async function connectDB() {
    if (!MONGODB_URI) {
        throw new Error(
            "Please define the MONGODB_URI environment variable inside .env"
        )
    }

    // If already connected, return existing connection
    if (cached.conn) {
        return cached.conn
    }

    // If no connection promise exists, create one
    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI)
    }

    // Wait for connection
    cached.conn = await cached.promise

    return cached.conn
}
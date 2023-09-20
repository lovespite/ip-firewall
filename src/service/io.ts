import mongoose from 'mongoose'

declare global {
    var mongoose: any // This must be a `var` and not a `let / const`
}

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
    throw new Error(
        'Please define the MONGODB_URI environment variable inside .env.local'
    );
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = {conn: null, promise: null};
}

async function db_connect() {
    if (cached.conn) {
        return cached.conn;
    }
    if (!cached.promise) {

        console.log('Connecting to MongoDB...' + MONGODB_URI)

        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose
            .connect(MONGODB_URI, opts)
            .then((mongoose) => {
                console.log('MongoDB Connected')
                return mongoose;
            });
    }
    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        console.log('MongoDB Connection Error', e)
        throw e;
    }

    return cached.conn;
}

export default db_connect;
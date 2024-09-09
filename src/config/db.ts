import mongoose from 'mongoose';
import { config } from './config';

const connectDb = async () => {
    try {
        
        mongoose.connection.on('connected', () => console.log("Database connected successfully"))
        
        mongoose.connection.on('error', (err) => console.log("Failed to connect database", err))
        
        await mongoose.connect(config.db as string)
        
    } catch (err) {     
        console.log("Failed to connect database", err);

        process.exit(1);
    }
}

export default connectDb;
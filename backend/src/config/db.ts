import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../config.env') });

const connectDB = async () => {
  try {
    const dbURI = process.env.DATABASE?.replace(
      '<PASSWORD>',
      process.env.DATABASE_PASSWORD || ''
    );

    if (!dbURI) {
      throw new Error('Database URI is missing!');
    }

    await mongoose.connect(dbURI);
    console.log('Connected to MongoDB successfully!');
  } catch (error) {
    console.error('Error connecting to db:', error);
    process.exit(1);
  }
};

export default connectDB;

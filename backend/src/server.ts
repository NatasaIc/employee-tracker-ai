import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { app } from './app';
import connectDB from './config/db';

connectDB();

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Employee from '../models/employeeModel';
import { employeeData } from '../seeders/employeeData';

dotenv.config({ path: path.join(__dirname, '../../../config.env') });

const seedDB = async () => {
  try {
    const dbURI = process.env.DATABASE?.replace(
      '<PASSWORD>',
      process.env.DATABASE_PASSWORD || ''
    );

    if (!dbURI) {
      throw new Error('Missing database URI');
    }

    await mongoose.connect(dbURI);
    await Employee.deleteMany();

    await Employee.insertMany(employeeData);
  } catch (error) {
    console.error('Error connecting to db:', error);
    process.exit(1);
  }
};

const deleteData = async () => {
  try {
    await Employee.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

// Command line argument handling for import or delete
if (process.argv[2] === '--delete') {
  deleteData();
} else if (process.argv[2] === '--import') {
  seedDB();
}
console.log(process.argv);

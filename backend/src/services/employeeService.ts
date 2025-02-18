import mongoose from 'mongoose';
import Employee from '../models/employeeModel';

// 🔹 Fetch employee by ID
export const getEmployeeById = async (employeeId: string) => {
  if (!mongoose.Types.ObjectId.isValid(employeeId)) {
    throw new Error('Invalid employee ID');
  }

  const employee = await Employee.findById(
    new mongoose.Types.ObjectId(employeeId)
  );
  if (!employee) {
    throw new Error('Employee not found');
  }
  return employee;
};

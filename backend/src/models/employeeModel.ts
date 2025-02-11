import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployee extends Document {
  name: string;
  email: string;
  position: string;
  sickLeaves: number;
  attendance: { date: string; status: 'Present' | 'Absent' }[];
}

const EmployeeSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  position: { type: String, required: true },
  sickLeaves: { type: Number, default: 0 },
  attendance: [{ date: String, status: String }],
});

const Employee = mongoose.model<IEmployee>('Employee', EmployeeSchema);

export default Employee;

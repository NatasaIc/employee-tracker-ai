import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployee extends Document {
  name: string;
  email: string;
  position: string;
  department: string;
  userType: 'employee' | 'manager' | 'admin';
  workAnniversary: Date;
  sickLeaves: number;
  maxSickleaves: number;
  vacationDays: number;
  vacationTaken: number;
  attendance: { date: string; status: 'Present' | 'Absent' }[];
}

const EmployeeSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  position: { type: String, required: true },
  department: { type: String, required: true },
  userType: {
    type: String,
    enum: ['employee', 'manager', 'admin'],
    required: true,
  },
  workAnniversary: { type: Date },
  sickLeaves: { type: Number, default: 0 },
  maxSickleaves: { type: Number, default: 30 },
  vacationDays: { type: Number, default: 35 },
  vacationTaken: { type: Number, default: 0 },
  attendance: [{ date: String, status: String }],
});

const Employee = mongoose.model<IEmployee>('Employee', EmployeeSchema);

export default Employee;

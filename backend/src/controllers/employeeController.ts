import express, { Request, Response } from 'express';
import Employee from '../models/employeeModel';
import asyncHandler from '../middleware/asyncHandler';

const getEmployees = asyncHandler(async (req: Request, res: Response) => {
  const employees = await Employee.find();
  res.json(employees);
});

const addEmployee = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, position } = req.body;
  const newEmployee = new Employee({ name, email, position });
  await newEmployee.save();
  res.status(201).json(newEmployee);
});

const markAttendance = asyncHandler(async (req: Request, res: Response) => {
  const { email, date, status } = req.body;
  const employee = await Employee.findOne({ email });
  if (!employee) {
    res.status(404).json({ message: 'Employee not found' });
    return;
  }

  employee.attendance.push({ date, status });
  await employee.save();
  res.json(employee);
});

export const employeeController = {
  getEmployees,
  addEmployee,
  markAttendance,
};

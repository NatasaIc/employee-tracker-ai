import express, { Request, Response } from 'express';
import Employee from '../models/employeeModel';
import asyncHandler from '../middleware/asyncHandler';

const getEmployees = asyncHandler(async (req: Request, res: Response) => {
  const employees = await Employee.find();
  res.json(employees);
});

const addEmployee = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, position, department, userRole } = req.body;

  if (!userRole || !['employee', 'manager', 'admin'].includes(userRole)) {
    res.status(400).json({ message: 'Invalid user role' });
    return;
  }

  const newEmployee = new Employee({
    name,
    email,
    position,
    department,
    userRole,
  });
  await newEmployee.save();
  res.status(201).json(newEmployee);
});

const markAttendance = asyncHandler(async (req: Request, res: Response) => {
  const { name, date, status } = req.body;
  const employee = await Employee.findOne({ name });
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

import mongoose from 'mongoose';
import axios from 'axios';
import Employee, { IEmployee } from '../models/employeeModel';
import { Request, Response } from 'express';

// Define the structure of the AI prediction response
interface AIPredictionResponse {
  employeeId: string;
  burnoutRisk: string;
  burnoutRiskClass: string;
  futureProductivity: Array<{ ds: string; yhat: number }>;
  explanation: {
    sick_leave_usage: number;
    vacation_usage: number;
    overtime_hours: number;
    project_deadlines: number;
  };
}

// Fetch AI predictions for an employee
export const getEmployeeInsights = async (
  employeeId: string
): Promise<AIPredictionResponse | null> => {
  try {
    // Fetch employee data from MongoDB
    const employee: IEmployee | null = await Employee.findById(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Prepare data for the AI model
    const employeeData = {
      employeeId: employee._id.toString(), // Explicitly cast to string
      sickLeavesUsed: employee.sickLeaves,
      maxSickLeaves: employee.maxSickleaves,
      vacationTaken: employee.vacationTaken,
      totalVacation: employee.vacationDays,
      attendanceRecords: employee.attendance,
      overtimeHours: employee.overtimeHours || 0, // Default to 0 if not provided
      projectDeadlines: employee.projectDeadlines || 0, // Default to 0 if not provided
    };

    // Send data to the Python AI service
    const response = await axios.post<AIPredictionResponse>(
      `http://127.0.0.1:8001/predict`,
      employeeData
    );

    // Return the AI predictions
    return response.data;
  } catch (error) {
    console.error('Error fetching AI predictions:', error);
    return null;
  }
};

// Controller to handle insights requests
export const getInsights = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;

    // Fetch AI predictions
    const predictions = await getEmployeeInsights(employeeId);
    if (!predictions) {
      return res.status(404).json({ message: 'Failed to fetch insights' });
    }

    // Return the predictions to the frontend
    res.status(200).json(predictions);
  } catch (error) {
    console.error('Error in insights controller:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

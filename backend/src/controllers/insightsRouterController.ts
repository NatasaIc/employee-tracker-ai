//🔹 Fetches real employee work data from MongoDB using employeeId.
//🔹 Sends relevant work metrics to the AI model for predictions.
//🔹 Returns employee details + AI insights for frontend visualization.
import express, { Request, Response } from 'express';
import axios from 'axios';
import Employee from '../models/employeeModel';

const router = express.Router();

router.get('/productivity/:employeeId', async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      res.status(404).json({ message: 'Employee not found' });
      return;
    }

    const employeeProductivitiData = {
      employeeId: employee._id,
      name: employee.name,
      department: employee.department,
      sickLeavesUsed: employee.sickLeaves,
      maxSickLeaves: employee.maxSickleaves,
      vacationTaken: employee.vacationTaken,
      totalVacation: employee.vacationDays,
      attendanceRecords: employee.attendance,
    };

    const response = await axios.post(`http://127.0.0.1:8001/predict`, {
      employeeId: employee._id,
      sickLeavesUsed: employee.sickLeaves,
      maxSickLeaves: employee.maxSickleaves,
      vacationTaken: employee.vacationTaken,
      totalVacation: employee.vacationDays,
      attendanceRecords: employee.attendance,
    });
    const predictions = response.data;

    res.status(200).json({
      employee: employeeProductivitiData,
      predictions,
    });
  } catch (error) {
    console.error('Error fetching AI predictions:', error);
    res.status(500).json({ message: 'Error fetching AI predictions' });
  }
});

export default router;

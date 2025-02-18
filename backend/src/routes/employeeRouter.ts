import express from 'express';
import { employeeController } from '../controllers/employeeController';

const router = express.Router();

router
  .route('/')
  .get(employeeController.getEmployees)
  .post(employeeController.addEmployee);

router.route('/attendance').post(employeeController.markAttendance);

export default router;

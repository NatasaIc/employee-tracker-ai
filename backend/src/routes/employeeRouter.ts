import express from 'express';
import { employeeController } from '../controllers/employeeController';
import { chatbotResponse } from '../controllers/chatBotController';

const router = express.Router();

router
  .route('/')
  .get(employeeController.getEmployees)
  .post(employeeController.addEmployee);

router.route('/attendance').post(employeeController.markAttendance);

router.route('/chatbot').post(chatbotResponse);

export default router;

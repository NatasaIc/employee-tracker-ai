import express from 'express';
import { chatbotResponse } from '../controllers/chatBotController';

const router = express.Router();

router.route('/').post(chatbotResponse);

export default router;

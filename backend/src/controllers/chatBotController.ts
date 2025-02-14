import express, { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import mongoose from 'mongoose';
import Employee from '../models/employeeModel';
import ChatHistory from '../models/chatHistory';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../config.env') });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export const chatbotResponse = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    let { employeeId, message } = req.body;
    if (!employeeId || !message) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    console.log(`Processing chatbot request for employee ${employeeId}`);
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      res.status(404).json({ message: 'Invalid employee ID' });
      return;
    }

    const employee = await Employee.findById(
      new mongoose.Types.ObjectId(employeeId)
    );
    if (!employee) {
      res.status(404).json({ message: 'Employee not found' });
      return;
    }

    const chatHistory = await ChatHistory.findOne({ employeeId, message });
    if (chatHistory) {
      res.json({ message: chatHistory.response });
      return;
    }

    const sickLeaveMessage = `This employee has ${employee.sickLeaves} sick leves left`;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(
      `${sickLeaveMessage}\nUser question: ${message}`
    );

    let aiResponse = 'No response generated';
    if (result?.response?.candidates && result.response.candidates.length > 0) {
      aiResponse =
        result.response.candidates[0]?.content?.parts[0]?.text ||
        'No response generated.';
    }

    await ChatHistory.create({ employeeId, message, response: aiResponse });

    res.status(200).json({ response: aiResponse });
    return;
  } catch (error) {
    console.error('Error processing chatbot request:', error);
    res.status(500).json({ message: 'Error processing request' });
    return;
  }
};

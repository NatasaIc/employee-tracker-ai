import express, { Request, Response } from 'express';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
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
  // 🔹 Step 1: Extract and Validate Request Data
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

    // 🔹 Step 2: Retrieve Employee Data
    const employee = await Employee.findById(
      new mongoose.Types.ObjectId(employeeId)
    );
    if (!employee) {
      res.status(404).json({ message: 'Employee not found' });
      return;
    }

    // 🔹 Step 3: Fetch the Last 5 Messages from Chat History (if available)
    let chatHistory = await ChatHistory.findOne({ employeeId });
    const lastMessages = chatHistory?.messages
      ? chatHistory.messages.slice(-5)
      : [];
    const previousMessage = lastMessages
      .map(
        (msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.text}`
      )
      .join('\n');

    // 🔹 Step 4: Generate AI Prompt with Employee Data and Chat History
    const prompt = `
    You are an HR assistant chatbot that answers employee questions in a friendly, professional manner.
    You have access to the following details about the employee:
  
  - Name: ${employee.name}
  - Position: ${employee.position}
  - Department: ${employee.department}
  - Work Anniversary: ${employee.workAnniversary.toDateString()}
  - Maximum Sick Leaves: ${employee.maxSickleaves}
  - Sick Leaves Used: ${employee.sickLeaves}
  - Vacation Days Allocated: ${employee.vacationDays}
  - Vacation Days Taken: ${employee.vacationTaken}
  - Remaining Vacation Days: ${employee.vacationDays - employee.vacationTaken}

  HR Policies:
  - Employees can take up to ${employee.maxSickleaves} sick leaves per year.
  - Vacation days must be requested via the HR portal.
  - Salaries are processed on the 25th of each month.
  - For workplace issues, contact HR at hr@company.com.

  Employee's Question:
  "${message}"

  **Your task**: Answer the employee's question using the provided information. DO NOT say you "do not have access to this information." If a question is unclear, ask for clarification.
`;

    // 🔹 Step 5: Send Request to Google Gemini AI
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);

    console.log('Full AI Response:', JSON.stringify(result, null, 2));

    // 🔹 Step 6: Extract AI Response Text
    let aiResponse = 'No response generated';
    if (
      result?.response?.candidates &&
      result.response.candidates.length > 0 &&
      result.response.candidates[0]?.content?.parts
    ) {
      (aiResponse =
        result.response.candidates[0].content.parts
          .map((part: any) => part.text)
          .join('\n') || 'No response generated.'),
        // ✅ Remove unnecessary line breaks for cleaner formatting
        (aiResponse = aiResponse.replace(/\n+/g, ' '));
    }

    //🔹 Step 7: Generate Adaptive Follow-ups Based on the User's Question
    let followUpQuestion = '';

    if (message.toLowerCase().includes('vacation')) {
      followUpQuestion = 'Would you like to request time off?';
    } else if (
      message.toLowerCase().includes('sick leave') ||
      message.toLowerCase().includes('sick days')
    ) {
      followUpQuestion = 'Do you need to report a sick day?';
    } else if (
      message.toLowerCase().includes('payday') ||
      message.toLowerCase().includes('salary')
    ) {
      followUpQuestion = 'Do you have payroll-related concerns? 💰';
    } else if (
      message.toLowerCase().includes('hr policy') ||
      message.toLowerCase().includes('remote work')
    ) {
      followUpQuestion = 'Would you like to read the full HR policy? 📜';
    } else if (message.toLowerCase().includes('work anniversary')) {
      followUpQuestion =
        'Would you like to see any company perks for long-term employees? 🎉';
    }

    if (followUpQuestion) {
      aiResponse += `${followUpQuestion}`;
    }

    // 🔹 Step 8: Store Conversation History
    if (!chatHistory) {
      await ChatHistory.create({
        employeeId,
        messages: [
          {
            role: 'user',
            text: message || 'No message provided',
            timestamp: new Date(),
          },
          {
            role: 'assistant',
            text: aiResponse || 'No API response',
            timestamp: new Date(),
          },
        ],
      });
    } else {
      if (!chatHistory || !Array.isArray(chatHistory.messages)) {
        chatHistory = new ChatHistory({
          employeeId,
          messages: [],
        });
      }
      if (!Array.isArray(chatHistory.messages)) {
        chatHistory.messages = [];
      }
      chatHistory.messages.push({
        role: 'user',
        text: message,
        timestamp: new Date(),
      });
      chatHistory.messages.push({
        role: 'assistant',
        text: aiResponse,
        timestamp: new Date(),
      });
      await chatHistory.save();
    }

    // 🔹 Step 9: Send Response to the User
    res.status(200).json({ response: aiResponse });
    return;
  } catch (error) {
    // 🔹 Step 10: Handle Errors
    console.error('Error processing chatbot request:', error);
    res.status(500).json({ message: 'Error processing request' });
    return;
  }
};

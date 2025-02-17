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

    const greeting = `Hello ${employee.name}!`;
    const workAnniversary = employee.workAnniversary
      ? new Date(employee.workAnniversary).toDateString()
      : 'Work anniversary not available';
    const vacationStatus = `You have ${
      employee.vacationDays - employee.vacationTaken
    } vacation days left.`;
    const sickLeaveStatus = `This employee has ${employee.sickLeaves} sick leves left`;

    let additionalContext = `${greeting}\n${workAnniversary}\n${sickLeaveStatus}\n${vacationStatus}\n`;

    if (employee.department.toLowerCase() === 'human resources') {
      additionalContext +=
        'You are an HR staff member, so you can also answer questions about company policies, payroll, and hiring procedures.';
    }

    const hrKnowledge = `
      Company HR Policies:
      - Employees can take up to ${employee.maxSickleaves} sick leaves per year.
      - You can request vacation days through the HR portal.
      - Salaries are processed on the 25th of each month.
      - For workplace issues, contact the HR team at hr@company.com.
    `;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
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
    console.log('sending prompt to gemini:\n', prompt);
    const result = await model.generateContent(prompt);

    console.log('Full AI Response:', JSON.stringify(result, null, 2));
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
        (aiResponse = aiResponse.replace(/\n+/g, ' '));
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

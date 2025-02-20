import express, { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import mongoose from 'mongoose';
import { getEmployeeById } from '../services/employeeService';
import { getChatHistory, saveChatHistory } from '../services/chatService';
import {
  generateAiPrompt,
  fetchAiResponse,
  generateFollowUpQuestion,
} from '../services/aiService';

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

    // ✅ Step 2: Fetch Employee and Chat History
    const employee = await getEmployeeById(employeeId);
    const lastMessages = (await getChatHistory(employeeId)) || [];
    const previousMessages = lastMessages
      .map(
        (msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.text}`
      )
      .join('\n');

    // ✅ Step 3: Generate AI Prompt and Fetch AI Response
    const prompt = await generateAiPrompt(employee, previousMessages, message);
    let aiResponse = await fetchAiResponse(prompt);

    // ✅ Step 4: Append Follow-up Suggestion
    const followUpQuestion = generateFollowUpQuestion(message);
    if (followUpQuestion) {
      aiResponse += `\n\n---\n ${followUpQuestion}`;
    }

    // ✅ Step 5: Save Chat History and Send Response
    await saveChatHistory(employeeId, message, aiResponse);
    res.status(200).json({ response: aiResponse });
  } catch (error) {
    console.error('Error processing chatbot request:', error);
    res.status(500).json({ message: 'Error processing request' });
  }
};

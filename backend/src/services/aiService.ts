import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../config.env') });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

// 🔹 Define tone adaptation based on user role
const getAssistantTone = (userRole: string) => {
  if (userRole === 'Manager') {
    return 'You are a friendly and engaging HR chatbot. Keep the conversation light and positive. Use emojis where appropriate.';
  } else if (userRole === 'manager') {
    return 'You are a professional HR chatbot for managers. Provide structured responses that are direct and informative.';
  } else if (userRole === 'admin') {
    return 'You are an HR and payroll assistant. Maintain a formal and professional tone with detailed, accurate information.';
  }
  return 'You are an HR chatbot';
};

// 🔹 Generate AI Prompt based on Employee Data
export const generateAiPrompt = (
  employee: any,
  previousMessages: string,
  message: string
) => {
  const assistantTone = getAssistantTone(employee.role);

  return `
  ${assistantTone}

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

    **Previous Conversation History (last 5 messages):**
    ${previousMessages}

    Employee's Question:
    "${message}"

    **Your task**: Answer based on the user's role.
    - If they are an employee, be engaging and friendly.
    - If they are a manager, be professional but approachable.
    - If they are an admin, provide clear, precise, and formal responses.
  `;
};

// 🔹 Fetch AI Response from Google Gemini API
export const fetchAiResponse = async (prompt: string) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const result = await model.generateContent(prompt);

  let aiResponse = 'No response generated';

  const candidates = result?.response?.candidates || [];

  if (candidates.length > 0) {
    aiResponse =
      candidates[0]?.content?.parts.map((part: any) => part.text).join(' ') ||
      'No response generated.';
  }
  return aiResponse.replace(/\n+/g, ' ');
};

// 🔹 Generate Adaptive Follow-ups Based on Message
export const generateFollowUpQuestion = (message: string) => {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('vacation'))
    return 'Would you like to request time off? 🌴';
  if (lowerMessage.includes('sick leave') || lowerMessage.includes('sick days'))
    return 'Do you need to report a sick day? 🤒';
  if (lowerMessage.includes('payday') || lowerMessage.includes('salary'))
    return 'Do you have payroll-related concerns? 💰';
  if (
    lowerMessage.includes('hr policy') ||
    lowerMessage.includes('remote work')
  )
    return 'Would you like to read the full HR policy? 📜';
  if (lowerMessage.includes('work anniversary'))
    return 'Would you like to see any company perks for long-term employees? 🎉';
  return '';
};

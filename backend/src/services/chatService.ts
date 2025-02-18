import ChatHistory from '../models/chatHistory';

// 🔹 Get last 5 messages from chat history
export const getChatHistory = async (employeeId: string) => {
  const chatHistory = await ChatHistory.findOne({ employeeId });
  return chatHistory?.messages ? chatHistory.messages.slice(-5) : [];
};

// 🔹 Save new messages to chat history
export const saveChatHistory = async (
  employeeId: string,
  message: string,
  aiResponse: string
) => {
  let chatHistroy = await ChatHistory.findOne({ employeeId });

  if (!chatHistroy) {
    chatHistroy = new ChatHistory({ employeeId, messages: [] });
  }

  if (!Array.isArray(chatHistroy.messages)) {
    chatHistroy.messages = [];
  }

  chatHistroy.messages.push(
    {
      role: 'user',
      text: message,
      timestamp: new Date(),
    },
    { role: 'assistant', text: aiResponse, timestamp: new Date() }
  );

  await chatHistroy.save();
};

import mongoose, { Schema, Document } from 'mongoose';

interface IChatHistory extends Document {
  employeeId: string;
  messages: { role: 'user' | 'assistant'; text: string; timestamp: Date }[];
}

const ChatHistorySchema: Schema = new Schema({
  employeeId: { type: String, required: true },
  message: [
    {
      role: { type: String, enum: ['user', 'assistant'], required: true },
      text: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

export default mongoose.model<IChatHistory>('ChatHistory', ChatHistorySchema);

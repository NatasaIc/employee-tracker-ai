import mongoose, { Schema, Document } from 'mongoose';

interface IChatHistory extends Document {
  employeeId: string;
  message: string;
  response: string;
  timestamp: Date;
}

const ChatHistorySchema: Schema = new Schema({
  employeeId: { type: String, required: true },
  message: { type: String, required: true },
  response: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model<IChatHistory>('ChatHistory', ChatHistorySchema);

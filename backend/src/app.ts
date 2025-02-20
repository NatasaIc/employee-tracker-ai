import express, { Request, Response } from 'express';
import cors from 'cors';
import employeeRouter from './routes/employeeRouter';
import chatBotRouter from './routes/chatBotRouter';
import statsRouter from './routes/statsRouter';

export const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/employees', employeeRouter);
app.use('/api/chatbot', chatBotRouter);
app.use('/api/stats', statsRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, Typescript with express');
});

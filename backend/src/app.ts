import express, { Request, Response } from 'express';
import cors from 'cors';
import employeeRouter from './routes/employeeRouter';
import rateLimit from 'express-rate-limit';

export const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/employees', employeeRouter);

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: 'Too many requests from this IP, please try again after a minute.',
});

app.use(limiter);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, Typescript with express');
});

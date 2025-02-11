import express, { Request, Response } from 'express';
import employeeRouter from './routes/employeeRouter';

export const app = express();

app.use(express.json());

app.use('/api/employees', employeeRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, Typescript with express');
});

import { Request, Response } from 'express';
import asyncHandler from '../middleware/asyncHandler';
import { fetchAdminStats, fetchManagerStats } from '../services/statsService';

const getAdminStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await fetchAdminStats();
  res.status(200).json(stats);
});

const getManagerStats = asyncHandler(async (req: Request, res: Response) => {
  const { managerId } = req.params;
  const stats = await fetchManagerStats(managerId);
  res.status(200).json(stats);
});

export const statsController = {
  getAdminStats,
  getManagerStats,
};

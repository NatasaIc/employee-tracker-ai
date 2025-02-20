import express from 'express';
import { statsController } from '../controllers/statsController';

const router = express.Router();

router.route('/admin').get(statsController.getAdminStats);

router.route('/manager/:managerId').get(statsController.getManagerStats);

export default router;

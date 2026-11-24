import { Router } from 'express';
import authRoutes from './authRoutes.js';
import mesaRoutes from './mesaRoutes.js';
import reservaRoutes from './reservaRoutes.js';

const router = Router();

router.get('/health', (req, res) => res.json({ status: 'ok' }));
router.use('/auth', authRoutes);
router.use('/mesas', mesaRoutes);
router.use('/reservas', reservaRoutes);

export default router;

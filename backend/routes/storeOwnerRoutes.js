import express from 'express';
import { getStoreOwnerDashboard } from '../controllers/storeOwnerController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRoles('store_owner'));

router.get('/dashboard', getStoreOwnerDashboard);

export default router;

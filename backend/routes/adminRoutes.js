import express from 'express';
import {
  getAdminStats,
  getUsers,
  getUserById,
  createUser,
  getStores,
  createStore,
  getAllRatings,
} from '../controllers/adminController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { validateUserRegistration, validateStoreCreation } from '../middleware/validator.js';

const router = express.Router();

// Apply auth & admin role to all admin routes
router.use(authenticateToken);
router.use(authorizeRoles('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.post('/users', validateUserRegistration, createUser);
router.get('/stores', getStores);
router.post('/stores', validateStoreCreation, createStore);
router.get('/ratings', getAllRatings);

export default router;

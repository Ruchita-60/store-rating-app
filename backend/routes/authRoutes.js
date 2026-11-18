import express from 'express';
import { register, login, getMe, changePassword } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateUserRegistration, validatePasswordChange } from '../middleware/validator.js';

const router = express.Router();

router.post('/register', validateUserRegistration, register);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);
router.post('/change-password', authenticateToken, validatePasswordChange, changePassword);

export default router;

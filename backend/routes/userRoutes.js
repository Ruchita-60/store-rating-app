import express from 'express';
import {
  getStoresForUser,
  submitOrUpdateRating,
  getMyRatings,
} from '../controllers/userController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { validateRating } from '../middleware/validator.js';

const router = express.Router();

router.use(authenticateToken);

// Stores viewable by normal users (and admins if testing)
router.get('/stores', authorizeRoles('user', 'admin'), getStoresForUser);

// Ratings submission & viewing strictly for users
router.post('/ratings', authorizeRoles('user'), validateRating, submitOrUpdateRating);
router.get('/my-ratings', authorizeRoles('user'), getMyRatings);

export default router;

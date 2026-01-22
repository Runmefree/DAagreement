import { Router } from 'express';
import { signup, login, googleLogin, getProfile } from '../controllers/authController';
import { authMiddleware } from '../middleware/requireAuth';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/google-login', googleLogin);
router.get('/profile', authMiddleware, getProfile);

export default router;

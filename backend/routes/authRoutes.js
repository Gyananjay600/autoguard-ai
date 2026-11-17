import { Router } from 'express';
import AuthController from '../controllers/authController.js';
import { validateRegister, validateLogin } from '../middleware/validator.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/register', validateRegister, AuthController.register);
router.post('/login', validateLogin, AuthController.login);
router.get('/me', authenticateToken, AuthController.getCurrentUser);

export default router;

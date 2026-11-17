import { Router } from 'express';
import AdminController from '../controllers/adminController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// Only ADMIN can access admin routes
router.use(authenticateToken);
router.use(authorizeRoles('ADMIN'));

router.get('/panel', AdminController.getAdminPanelData);

router.post('/knowledge', AdminController.saveKnowledgeArticle);
router.put('/knowledge/:id', AdminController.updateKnowledgeArticle);
router.delete('/knowledge/:id', AdminController.deleteKnowledgeArticle);

router.post('/users/:id/role', AdminController.updateUserRole);
router.delete('/users/:id', AdminController.deleteUser);

export default router;

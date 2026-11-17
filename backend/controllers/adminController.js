import KnowledgeService from '../services/knowledgeService.js';
import UserService from '../services/userService.js';
import { query } from '../config/db.js';

export class AdminController {
  /**
   * GET /api/admin/panel
   * Returns knowledge articles, user list, and AI request audit logs
   */
  static async getAdminPanelData(req, res, next) {
    try {
      const articles = await KnowledgeService.getAll();
      const users = await UserService.getAllUsers();
      const aiLogs = await query('SELECT * FROM ai_request_log ORDER BY created_at DESC LIMIT 100');

      // Summary statistics for admin overview
      const [logStats] = await query(`
        SELECT 
          COUNT(*) as totalAiRequests,
          ROUND(AVG(latency_ms), 0) as avgLatencyMs,
          SUM(CASE WHEN risk_level = 'HIGH' THEN 1 ELSE 0 END) as totalHighRiskFlags
        FROM ai_request_log
      `);

      res.status(200).json({
        success: true,
        articles,
        users,
        aiLogs,
        stats: logStats
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/admin/knowledge
   */
  static async saveKnowledgeArticle(req, res, next) {
    try {
      const { title, category, content } = req.body;
      if (!title || !title.trim()) {
        return res.status(400).json({ success: false, message: 'Article title is required.' });
      }

      const article = await KnowledgeService.save({ title, category, content });

      res.status(201).json({
        success: true,
        message: 'Knowledge base article saved and re-indexed into RAG store.',
        article
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/admin/knowledge/:id
   */
  static async updateKnowledgeArticle(req, res, next) {
    try {
      const id = req.params.id;
      const { title, category, content } = req.body;

      const article = await KnowledgeService.save({ id, title, category, content });

      res.status(200).json({
        success: true,
        message: 'Knowledge base article updated successfully.',
        article
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/admin/knowledge/:id
   */
  static async deleteKnowledgeArticle(req, res, next) {
    try {
      const id = req.params.id;
      await KnowledgeService.delete(id);

      res.status(200).json({
        success: true,
        message: 'Knowledge base article removed successfully.'
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/admin/users/:id/role
   */
  static async updateUserRole(req, res, next) {
    try {
      const id = req.params.id;
      const { role } = req.body;

      if (!['OWNER', 'ENGINEER', 'ADMIN'].includes(role)) {
        return res.status(400).json({ success: false, message: `Invalid role: ${role}` });
      }

      const user = await UserService.updateRole(id, role);

      res.status(200).json({
        success: true,
        message: `Updated user '${user.name}' role to ${role}.`,
        user
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/admin/users/:id
   */
  static async deleteUser(req, res, next) {
    try {
      const id = req.params.id;
      if (Number(id) === Number(req.user.id)) {
        return res.status(400).json({ success: false, message: 'You cannot delete your own administrative account.' });
      }

      await UserService.deleteUser(id);

      res.status(200).json({
        success: true,
        message: 'User account removed.'
      });
    } catch (err) {
      next(err);
    }
  }
}

export default AdminController;

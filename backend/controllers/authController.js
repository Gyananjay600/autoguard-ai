import UserService from '../services/userService.js';

export class AuthController {
  /**
   * POST /api/auth/register
   */
  static async register(req, res, next) {
    try {
      const { name, email, password } = req.body;
      const user = await UserService.register({ name, email, password });

      res.status(201).json({
        success: true,
        message: 'Account registered successfully. You may now log in.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message
      });
    }
  }

  /**
   * POST /api/auth/login
   */
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const { token, user } = await UserService.login(email, password);

      res.status(200).json({
        success: true,
        message: 'Login successful.',
        token,
        user
      });
    } catch (err) {
      res.status(401).json({
        success: false,
        message: err.message
      });
    }
  }

  /**
   * GET /api/auth/me
   */
  static async getCurrentUser(req, res, next) {
    try {
      res.status(200).json({
        success: true,
        user: req.user
      });
    } catch (err) {
      next(err);
    }
  }
}

export default AuthController;

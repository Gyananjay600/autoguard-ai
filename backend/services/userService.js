import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

export class UserService {
  /**
   * Register a new user
   */
  static async register({ name, email, password }) {
    const cleanEmail = email.trim().toLowerCase();

    const existing = await query('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existing && existing.length > 0) {
      throw new Error('An account already exists for this email address.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await query(
      `INSERT INTO users (name, email, password, role)
       VALUES (?, ?, ?, 'OWNER')`,
      [name.trim(), cleanEmail, hashedPassword]
    );

    return await this.findById(result.insertId);
  }

  /**
   * Authenticate user with email and password, return JWT token and user profile
   */
  static async login(email, password) {
    const cleanEmail = email.trim().toLowerCase();
    const rows = await query('SELECT * FROM users WHERE email = ?', [cleanEmail]);

    if (!rows || rows.length === 0) {
      throw new Error('Invalid email or password.');
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'super_secret_jwt_key_autoguard_2026_enterprise',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.created_at
      }
    };
  }

  /**
   * Get all users
   */
  static async getAllUsers() {
    return await query('SELECT id, name, email, role, created_at FROM users ORDER BY id ASC');
  }

  /**
   * Find user by ID
   */
  static async findById(id) {
    const rows = await query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [id]);
    if (!rows || rows.length === 0) {
      throw new Error(`User not found with ID: ${id}`);
    }
    return rows[0];
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    const rows = await query('SELECT id, name, email, role, password, created_at FROM users WHERE email = ?', [email]);
    if (!rows || rows.length === 0) {
      throw new Error(`User not found with email: ${email}`);
    }
    return rows[0];
  }

  /**
   * Update role
   */
  static async updateRole(userId, role) {
    if (!['OWNER', 'ENGINEER', 'ADMIN'].includes(role)) {
      throw new Error(`Invalid role: ${role}`);
    }

    await this.findById(userId);
    await query('UPDATE users SET role = ? WHERE id = ?', [role, userId]);
    return await this.findById(userId);
  }

  /**
   * Delete user
   */
  static async deleteUser(id) {
    await this.findById(id);
    await query('DELETE FROM users WHERE id = ?', [id]);
    return { success: true };
  }
}

export default UserService;

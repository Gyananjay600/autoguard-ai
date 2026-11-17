import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

/**
 * Authenticates incoming request via Authorization: Bearer <token>
 */
export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_autoguard_2026_enterprise');
    const users = await query('SELECT id, name, email, role FROM users WHERE id = ?', [decoded.id]);

    if (!users || users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session: User account does not exist or was deleted.'
      });
    }

    req.user = users[0];
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Invalid, expired, or malformed authentication token.'
    });
  }
}

/**
 * Role-Based Access Control Middleware
 * Supports single role or array of allowed roles
 */
export function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const allowed = roles.flat();
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to roles [${allowed.join(', ')}]. Your role is ${req.user.role}.`
      });
    }

    next();
  };
}

/**
 * Strict Vehicle Ownership Scoping
 * - OWNER can only access vehicles registered under their user_id
 * - ENGINEER and ADMIN can access all fleet vehicles
 */
export async function verifyVehicleOwnership(req, res, next) {
  try {
    const vehicleId = req.params.id || req.params.vehicleId || req.body.vehicleId;
    if (!vehicleId) {
      return res.status(400).json({ success: false, message: 'Vehicle ID is required.' });
    }

    const vehicles = await query('SELECT * FROM vehicles WHERE id = ?', [vehicleId]);
    if (!vehicles || vehicles.length === 0) {
      return res.status(404).json({ success: false, message: `Vehicle not found with ID: ${vehicleId}` });
    }

    const vehicle = vehicles[0];
    const isOwner = req.user.role === 'OWNER';
    const isOwnerMatch = Number(vehicle.user_id) === Number(req.user.id);

    if (isOwner && !isOwnerMatch) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: You do not have permission to view or manage this vehicle.'
      });
    }

    req.vehicle = vehicle;
    next();
  } catch (err) {
    next(err);
  }
}

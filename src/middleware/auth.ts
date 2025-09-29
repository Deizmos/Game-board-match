import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { AuthRequest, JWTPayload } from '../types';

// Protect routes - require authentication
export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided.'
      });
      return;
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
      
      // Get user from token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        res.status(401).json({
          status: 'error',
          message: 'Token is valid but user no longer exists'
        });
        return;
      }

      if (!user.isActive) {
        res.status(401).json({
          status: 'error',
          message: 'User account is deactivated'
        });
        return;
      }

      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid token'
      });
      return;
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error during authentication'
    });
    return;
  }
};

// Generate JWT token
export const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Optional auth - doesn't fail if no token
export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
        const user = await User.findById(decoded.id).select('-password');
        
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (error) {
        // Token is invalid, but we don't fail the request
        console.log('Invalid token in optional auth:', (error as Error).message);
      }
    }

    next();
  } catch (error) {
    next();
  }
};

// Check if user is the owner of a resource
export const checkOwnership = (resourceUserIdField: string = 'user') => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (!resourceUserId) {
      res.status(400).json({
        status: 'error',
        message: 'Resource user ID is required'
      });
      return;
    }

    if (req.user!._id.toString() !== resourceUserId.toString()) {
      res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only access your own resources.'
      });
      return;
    }

    next();
  };
};

// Check if user has specific role (for future role-based access)
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
      return;
    }

    // For now, we don't have roles in the user model, but this is ready for future implementation
    // if (!roles.includes(req.user.role)) {
    //   return res.status(403).json({
    //     status: 'error',
    //     message: `Access denied. Required role: ${roles.join(' or ')}`
    //   });
    // }

    next();
  };
};

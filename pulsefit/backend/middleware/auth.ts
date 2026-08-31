import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { memoryStore, isMongoConnected } from '../services/dataStore.js';
import { UserModel } from '../models/User.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
    status: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_fitness_token_key_2026';

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Access denied. No authorization token provided.',
    });
    return;
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);

    let user: any = null;
    if (isMongoConnected()) {
      try {
        user = await UserModel.findById(decoded.id).select('-password');
      } catch (err) {
        user = null;
      }
    }

    if (!user) {
      user = memoryStore.users.find((u) => u._id.toString() === decoded.id.toString());
    }

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
      return;
    }

    if (user.status === 'blocked') {
      res.status(403).json({
        success: false,
        message: 'Your account has been suspended by an administrator.',
      });
      return;
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      status: user.status,
    };

    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired session token. Please log in again.',
    });
    return;
  }
};

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Access forbidden. Administrator privileges required.',
    });
    return;
  }
  next();
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    const token = req.headers.authorization.split(' ')[1];
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      let user = memoryStore.users.find((u) => u._id.toString() === decoded.id.toString());
      if (user) {
        req.user = {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          name: user.name,
          status: user.status,
        };
      }
    } catch {
      // ignore
    }
  }
  next();
};

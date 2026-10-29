import { Request, Response, NextFunction } from 'express';
import { getSupabase, isSupabaseConfigured } from '../db/supabase.js';
import { store } from '../db/store.js';
import { config } from '../config.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Middleware to authenticate requests.
 * Supports Supabase JWT verification when configured.
 * In local development / offline demo mode, accepts a test bearer token or header user ID.
 */
export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Authentication token missing or invalid',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase()!;
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (error || !user) {
        res.status(401).json({ success: false, error: 'Invalid or expired session token' });
        return;
      }

      const role = await store.getUserRole(user.id);
      req.user = {
        id: user.id,
        email: user.email || '',
        role,
      };
      next();
      return;
    }

    // Allow secret admin key via X-Admin-Key header for management/automation (if securely configured)
    const adminKey = req.headers['x-admin-key'] as string | undefined;
    if (config.adminSecretKey && config.adminSecretKey.length >= 16 && adminKey === config.adminSecretKey) {
      req.user = {
        id: 'admin-service-account',
        email: 'admin@posturefit.internal',
        role: 'admin',
      };
      next();
      return;
    }

    // Local / offline fallback mode: Token can be a mock user token formatted as "mock_token_<userId>" or base64
    let userId = 'demo-user-123';
    let email = 'demo@posturefit.test';

    if (token.startsWith('mock_')) {
      const parts = token.split('_');
      if (parts.length >= 3) {
        userId = parts[2];
        email = `${userId}@posturefit.test`;
      }
    } else {
      userId = token;
      email = `${token}@posturefit.test`;
    }

    // Look up existing profile to preserve user's genuine email
    const existingProfile = await store.getProfile(userId);
    if (existingProfile && existingProfile.email) {
      email = existingProfile.email;
    } else {
      await store.upsertProfile({ id: userId, email });
    }
    const role = await store.getUserRole(userId);

    req.user = {
      id: userId,
      email,
      role,
    };
    next();
  } catch (err: any) {
    res.status(401).json({ success: false, error: 'Authentication failed' });
  }
};

/**
 * Middleware to require Admin privileges.
 */
export const requireAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Allow secret admin key via X-Admin-Key header for management/automation (if securely configured)
  const adminKey = req.headers['x-admin-key'] as string | undefined;
  if (config.adminSecretKey && config.adminSecretKey.length >= 16 && adminKey === config.adminSecretKey) {
    next();
    return;
  }

  if (!req.user) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }

  const role = await store.getUserRole(req.user.id);
  if (role !== 'admin') {
    res.status(403).json({ success: false, error: 'Forbidden: Administrator privileges required' });
    return;
  }

  next();
};

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole } from '../types/index.js';
import { getSupabaseAdmin, getSupabase } from '../config/supabase.js';

export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Missing or malformed Bearer token.',
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    // Check for demo tokens (useful for testing or when running without external Supabase service)
    if (token.startsWith('demo-')) {
      const isDemoAdmin = token === 'demo-admin-token';
      req.user = {
        id: isDemoAdmin ? '00000000-0000-0000-0000-000000000002' : '00000000-0000-0000-0000-000000000001',
        email: isDemoAdmin ? 'admin@helpdesk.ai' : 'customer@example.com',
        role: isDemoAdmin ? 'admin' : 'customer',
        full_name: isDemoAdmin ? 'Lead Admin' : 'Alex Customer',
      };
      next();
      return;
    }

    const supabase = getSupabaseAdmin() || getSupabase();

    if (!supabase) {
      // Fallback if supabase is not initialized
      req.user = {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'customer@example.com',
        role: 'customer',
        full_name: 'Demo Customer',
      };
      next();
      return;
    }

    // Verify token with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.getUser(token);

    if (authError || !authData.user) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired session token.',
      });
      return;
    }

    const userId = authData.user.id;
    const email = authData.user.email || '';

    // Fetch user profile from database to get genuine server-verified role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, role, email')
      .eq('id', userId)
      .single();

    let userRole: UserRole = 'customer';
    let fullName = authData.user.user_metadata?.full_name || email.split('@')[0];

    if (profile && !profileError) {
      userRole = (profile.role as UserRole) || 'customer';
      if (profile.full_name) fullName = profile.full_name;
    } else {
      // If profile hasn't been created by trigger yet, create or verify
      userRole = authData.user.user_metadata?.role === 'admin' ? 'admin' : 'customer';
      await supabase.from('profiles').upsert({
        id: userId,
        email,
        full_name: fullName,
        role: userRole,
      });
    }

    req.user = {
      id: userId,
      email,
      role: userRole,
      full_name: fullName,
    };

    next();
  } catch (error: any) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication verification failed.',
    });
  }
};

export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Access denied. Administrator privileges required.',
    });
    return;
  }

  next();
};


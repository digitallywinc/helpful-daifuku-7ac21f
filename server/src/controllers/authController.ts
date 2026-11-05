import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { getSupabaseAdmin, getSupabase } from '../config/supabase.js';
import { memoryStore } from '../services/store.js';

export const authController = {
  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const supabase = getSupabaseAdmin() || getSupabase();
      if (supabase) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          res.json({ success: true, profile });
          return;
        }
      }

      const memoryProfile = memoryStore.profiles.get(user.id);
      res.json({
        success: true,
        profile: memoryProfile || {
          id: user.id,
          email: user.email,
          full_name: user.full_name || user.email.split('@')[0],
          role: user.role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { full_name, avatar_url } = req.body;
      const updates: any = {};
      if (full_name !== undefined) updates.full_name = full_name;
      if (avatar_url !== undefined) updates.avatar_url = avatar_url;

      const supabase = getSupabaseAdmin() || getSupabase();
      if (supabase) {
        const { data: updated, error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id)
          .select()
          .single();

        if (!error && updated) {
          res.json({ success: true, profile: updated });
          return;
        }
      }

      const memoryProfile = memoryStore.profiles.get(user.id);
      if (memoryProfile) {
        Object.assign(memoryProfile, updates, { updated_at: new Date().toISOString() });
        res.json({ success: true, profile: memoryProfile });
        return;
      }

      res.status(404).json({ success: false, message: 'Profile not found' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};


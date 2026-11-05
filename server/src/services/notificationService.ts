import { getSupabaseAdmin, getSupabase } from '../config/supabase.js';
import { Notification } from '../types/index.js';
import { memoryStore } from './store.js';

export const notificationService = {
  async getUserNotifications(userId: string): Promise<Notification[]> {
    const supabase = getSupabaseAdmin() || getSupabase();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(30);

        if (!error && data) {
          return data as Notification[];
        }
      } catch (err) {
        console.warn('Supabase fetch notifications error, using fallback:', err);
      }
    }

    const list = memoryStore.notifications.get(userId) || [];
    return [...list].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  async createNotification(
    userId: string,
    title: string,
    message: string,
    link?: string
  ): Promise<Notification> {
    const supabase = getSupabaseAdmin() || getSupabase();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            title,
            message,
            link,
            is_read: false,
          })
          .select()
          .single();

        if (!error && data) {
          return data as Notification;
        }
      } catch (err) {
        console.warn('Supabase create notification error, using fallback:', err);
      }
    }

    const newNotif: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: userId,
      title,
      message,
      is_read: false,
      link,
      created_at: new Date().toISOString(),
    };

    const current = memoryStore.notifications.get(userId) || [];
    current.unshift(newNotif);
    memoryStore.notifications.set(userId, current);

    return newNotif;
  },

  async notifyAdmins(title: string, message: string, link?: string): Promise<void> {
    const supabase = getSupabaseAdmin() || getSupabase();

    if (supabase) {
      try {
        const { data: adminProfiles } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'admin');

        if (adminProfiles && adminProfiles.length > 0) {
          const rows = adminProfiles.map((admin: any) => ({
            user_id: admin.id,
            title,
            message,
            link,
            is_read: false,
          }));

          await supabase.from('notifications').insert(rows);
          return;
        }
      } catch (err) {
        console.warn('Supabase notifyAdmins error, using fallback:', err);
      }
    }

    // Fallback store
    for (const [id, profile] of memoryStore.profiles.entries()) {
      if (profile.role === 'admin') {
        await this.createNotification(id, title, message, link);
      }
    }
  },

  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    const supabase = getSupabaseAdmin() || getSupabase();

    if (supabase) {
      try {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notificationId)
          .eq('user_id', userId);

        if (!error) return true;
      } catch (err) {
        console.warn('Supabase markAsRead error, using fallback:', err);
      }
    }

    const list = memoryStore.notifications.get(userId) || [];
    const notif = list.find((n) => n.id === notificationId);
    if (notif) {
      notif.is_read = true;
      return true;
    }
    return false;
  },

  async markAllAsRead(userId: string): Promise<boolean> {
    const supabase = getSupabaseAdmin() || getSupabase();

    if (supabase) {
      try {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', userId);

        if (!error) return true;
      } catch (err) {
        console.warn('Supabase markAllAsRead error, using fallback:', err);
      }
    }

    const list = memoryStore.notifications.get(userId) || [];
    list.forEach((n) => (n.is_read = true));
    return true;
  },
};


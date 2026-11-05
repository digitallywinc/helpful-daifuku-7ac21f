import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, X, Ticket, ExternalLink, Loader2 } from 'lucide-react';
import { Notification } from '../../types';
import { api } from '../../services/api';
import { Button } from '../ui/Button';
import { formatDistanceToNow } from 'date-fns';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onUnreadCountChange,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await api.notifications.getNotifications();
      setNotifications(data);
      const unread = data.filter((n) => !n.is_read).length;
      if (onUnreadCountChange) onUnreadCountChange(unread);
    } catch (e) {
      console.warn('Could not load notifications:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const handleMarkAsRead = async (id: string, link?: string | null) => {
    try {
      await api.notifications.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      if (onUnreadCountChange) {
        onUnreadCountChange(
          notifications.filter((n) => !n.is_read && n.id !== id).length
        );
      }
      if (link) {
        onClose();
        navigate(link);
      }
    } catch (e) {
      console.warn('Failed to mark read:', e);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.notifications.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      if (onUnreadCountChange) onUnreadCountChange(0);
    } catch (e) {
      console.warn('Failed to mark all as read:', e);
    }
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-card border-l shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Bell className="h-4 w-4" />
              </div>
              <h2 className="font-semibold text-base text-foreground">Notifications</h2>
              {unreadCount > 0 && (
                <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-primary hover:underline flex items-center gap-1 p-1"
                  title="Mark all as read"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 rounded-md text-muted-foreground hover:bg-accent transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mb-2 text-primary" />
                <p className="text-xs">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No notifications yet</p>
                <p className="text-xs mt-1">
                  Updates on your tickets and chat messages will appear here.
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleMarkAsRead(n.id, n.link)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex gap-3 ${
                    n.is_read
                      ? 'bg-card hover:bg-accent/40 border-border/60 opacity-80'
                      : 'bg-primary/5 hover:bg-primary/10 border-primary/20 shadow-xs'
                  }`}
                >
                  <div
                    className={`h-8 w-8 rounded-lg shrink-0 flex items-center justify-center ${
                      n.is_read
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    <Ticket className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-foreground leading-tight">
                        {n.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {n.message}
                    </p>
                    {n.link && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary mt-2">
                        <span>View details</span>
                        <ExternalLink className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                  {!n.is_read && (
                    <span className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


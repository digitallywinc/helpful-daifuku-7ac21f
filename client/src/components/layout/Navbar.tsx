import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Menu, Bell, Plus, Shield, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { NotificationDrawer } from './NotificationDrawer';
import { api } from '../../services/api';

interface NavbarProps {
  onOpenMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileMenu }) => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Poll for unread notifications periodically
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const notifs = await api.notifications.getNotifications();
        setUnreadCount(notifs.filter((n) => !n.is_read).length);
      } catch (e) {
        // Silent catch for background polling
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  const getPageTitle = () => {
    const p = location.pathname;
    if (p === '/dashboard') return 'Customer Overview';
    if (p.startsWith('/chat')) return 'AI Customer Support';
    if (p === '/tickets') return 'Support Tickets';
    if (p === '/tickets/new') return 'Create New Ticket';
    if (p.startsWith('/tickets/')) return 'Ticket Thread';
    if (p === '/faqs') return 'Knowledge Base & FAQs';
    if (p === '/profile') return 'My Profile Settings';
    if (p === '/admin') return 'Admin Dashboard';
    if (p === '/admin/tickets') return 'Ticket Operations Management';
    if (p.startsWith('/admin/tickets/')) return 'Admin Ticket Review';
    if (p === '/admin/faqs') return 'FAQ Management';
    if (p === '/admin/customers') return 'Customer Directory';
    if (p === '/admin/conversations') return 'AI Support Chat Logs';
    return 'HelpDesk AI';
  };

  return (
    <>
      <header className="h-16 border-b bg-card/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              {getPageTitle()}
            </h1>
          </div>
        </div>

        {/* Right: Quick actions, notifications, user avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Create Ticket Action (Customer) */}
          {!isAdmin && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => navigate('/tickets/new')}
              className="hidden sm:inline-flex gap-1.5 shadow-sm text-xs font-semibold"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Ticket</span>
            </Button>
          )}

          {/* Notifications Bell */}
          <button
            onClick={() => setIsNotifOpen(true)}
            className="relative p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            title="View notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* User Avatar */}
          <Link
            to="/profile"
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-primary/20 transition-all"
          >
            <Avatar
              name={user?.full_name || user?.email || 'User'}
              src={user?.avatar_url}
              size="sm"
            />
          </Link>
        </div>
      </header>

      {/* Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        onUnreadCountChange={(count) => setUnreadCount(count)}
      />
    </>
  );
};


import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Bot,
  LayoutDashboard,
  LifeBuoy,
  BookOpen,
  ShieldCheck,
  Ticket,
  FileQuestion,
  Users,
  MessagesSquare,
  LogOut,
  Sun,
  Moon,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { cn } from '../../utils/cn';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { user, isAdmin, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group',
      isActive
        ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
    );

  return (
    <aside className="w-64 border-r bg-card flex flex-col h-full select-none">
      {/* Brand Logo Header */}
      <div className="h-16 px-6 border-b flex items-center justify-between">
        <NavLink
          to={isAdmin ? '/admin' : '/dashboard'}
          className="flex items-center gap-2.5 font-bold text-lg tracking-tight text-foreground hover:opacity-90 transition-opacity"
          onClick={onCloseMobile}
        >
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-blue-400 text-primary-foreground flex items-center justify-center shadow-md shadow-primary/20">
            <Bot className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="leading-tight flex items-center gap-1.5">
              HelpDesk <span className="text-primary font-extrabold">AI</span>
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">
              Intelligent Support
            </span>
          </div>
        </NavLink>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        {/* Customer Portal Links */}
        <div>
          <p className="px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Customer Portal
          </p>
          <nav className="space-y-1">
            <NavLink to="/dashboard" className={navLinkClass} onClick={onCloseMobile}>
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              <span>Overview</span>
            </NavLink>

            <NavLink to="/chat" className={navLinkClass} onClick={onCloseMobile}>
              <div className="relative flex items-center">
                <Bot className="h-4 w-4 shrink-0" />
                <Sparkles className="h-2.5 w-2.5 text-amber-500 absolute -top-1 -right-1" />
              </div>
              <span className="flex-1">AI Assistant</span>
              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                24/7
              </span>
            </NavLink>

            <NavLink to="/tickets" className={navLinkClass} onClick={onCloseMobile}>
              <LifeBuoy className="h-4 w-4 shrink-0" />
              <span>My Tickets</span>
            </NavLink>

            <NavLink to="/faqs" className={navLinkClass} onClick={onCloseMobile}>
              <BookOpen className="h-4 w-4 shrink-0" />
              <span>Knowledge Base</span>
            </NavLink>
          </nav>
        </div>

        {/* Administrator Portal Links (Visible if admin) */}
        {isAdmin && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between px-3 mb-2">
              <p className="text-[11px] font-semibold text-primary uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Administration</span>
              </p>
              <Badge variant="default" className="text-[10px] px-1.5 py-0">
                Staff
              </Badge>
            </div>
            <nav className="space-y-1">
              <NavLink to="/admin" end className={navLinkClass} onClick={onCloseMobile}>
                <LayoutDashboard className="h-4 w-4 shrink-0" />
                <span>Admin Dashboard</span>
              </NavLink>

              <NavLink to="/admin/tickets" className={navLinkClass} onClick={onCloseMobile}>
                <Ticket className="h-4 w-4 shrink-0" />
                <span>All Tickets</span>
              </NavLink>

              <NavLink to="/admin/faqs" className={navLinkClass} onClick={onCloseMobile}>
                <FileQuestion className="h-4 w-4 shrink-0" />
                <span>Manage FAQs</span>
              </NavLink>

              <NavLink to="/admin/customers" className={navLinkClass} onClick={onCloseMobile}>
                <Users className="h-4 w-4 shrink-0" />
                <span>Customers</span>
              </NavLink>

              <NavLink to="/admin/conversations" className={navLinkClass} onClick={onCloseMobile}>
                <MessagesSquare className="h-4 w-4 shrink-0" />
                <span>AI Chat Logs</span>
              </NavLink>
            </nav>
          </div>
        )}
      </div>

      {/* Bottom Profile Footer */}
      <div className="p-4 border-t bg-muted/20 space-y-3">
        {/* User Card */}
        <NavLink
          to="/profile"
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors group cursor-pointer"
          onClick={onCloseMobile}
        >
          <Avatar
            name={user?.full_name || user?.email || 'User'}
            src={user?.avatar_url}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate leading-tight">
              {user?.full_name || 'Guest User'}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Badge
                variant={isAdmin ? 'urgent' : 'secondary'}
                className="text-[9px] uppercase tracking-wider py-0 px-1"
              >
                {isAdmin ? 'Admin' : 'Customer'}
              </Badge>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-0.5" />
        </NavLink>

        {/* Quick controls: Theme & Sign out */}
        <div className="flex items-center justify-between pt-2 border-t border-border/60 px-1">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-accent"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="h-4 w-4 text-amber-400" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-slate-600" />
                <span>Dark</span>
              </>
            )}
          </button>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-xs font-medium text-rose-500 hover:text-rose-600 transition-colors p-1.5 rounded-md hover:bg-rose-500/10"
            title="Sign out of account"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, Calendar, LogOut, Check, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { format } from 'date-fns';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, signOut } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await updateProfile({
        full_name: fullName.trim(),
        avatar_url: avatarUrl.trim() || undefined,
      });
      success('Profile updated', 'Your display settings have been updated.');
    } catch (err: any) {
      error('Update failed', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Account Profile & Settings
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Manage your personal details and session preferences
        </p>
      </div>

      {/* Profile Overview Card */}
      <Card className="shadow-xs overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary/80 to-blue-600/80" />
        <CardContent className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-12 mb-6">
            <div className="flex items-end gap-4">
              <Avatar
                name={user?.full_name || user?.email || 'User'}
                src={user?.avatar_url}
                size="xl"
                className="ring-4 ring-card bg-card shadow-md"
              />
              <div className="mb-1">
                <h3 className="text-lg font-bold text-foreground">
                  {user?.full_name || 'Customer'}
                </h3>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <Badge
              variant={user?.role === 'admin' ? 'urgent' : 'default'}
              className="text-xs uppercase tracking-wider py-1 px-3 self-start sm:self-auto"
            >
              Role: {user?.role || 'Customer'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span>
                Joined{' '}
                {user?.created_at
                  ? format(new Date(user.created_at), 'MMMM d, yyyy')
                  : 'Recently'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Form */}
      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle>Edit Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate} className="space-y-4">
            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <Input
              label="Avatar Image URL (Optional)"
              placeholder="https://images.unsplash.com/photo-..."
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              helperText="Provide a direct link to an image hosted online."
            />

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                className="gap-2 font-semibold shadow-xs"
              >
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone / Sign Out */}
      <Card className="border-destructive/30 shadow-xs">
        <CardHeader>
          <CardTitle className="text-destructive text-base">Session Management</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-foreground">Sign out of active session</p>
            <p className="text-xs text-muted-foreground">
              You will need to sign in again to access your tickets and chats.
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleSignOut}
            className="gap-2 font-semibold"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};


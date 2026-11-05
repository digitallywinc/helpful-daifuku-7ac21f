import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { supabase, isSupabaseReady } from '../services/supabase';
import { api } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  role: UserRole;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role?: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loginAsDemo: (role: 'customer' | 'admin') => Promise<void>;
  updateProfile: (data: { full_name?: string; avatar_url?: string }) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('helpdesk_token'));
  const [loading, setLoading] = useState(true);

  // Sync token to localStorage and fetch user profile
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('helpdesk_token');

      if (!storedToken) {
        setLoading(false);
        return;
      }

      if (storedToken.startsWith('demo-')) {
        const isAdmin = storedToken === 'demo-admin-token';
        setToken(storedToken);
        setUser({
          id: isAdmin
            ? '00000000-0000-0000-0000-000000000002'
            : '00000000-0000-0000-0000-000000000001',
          full_name: isAdmin ? 'Sarah Jenkins (Admin)' : 'Alex Customer',
          email: isAdmin ? 'admin@helpdesk.ai' : 'customer@example.com',
          role: isAdmin ? 'admin' : 'customer',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        setLoading(false);
        return;
      }

      try {
        setToken(storedToken);
        const profile = await api.auth.getProfile();
        setUser(profile);
      } catch (error) {
        console.warn('Session verification failed, clearing token:', error);
        localStorage.removeItem('helpdesk_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen to Supabase auth state changes if configured
    if (isSupabaseReady && supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.access_token) {
            localStorage.setItem('helpdesk_token', session.access_token);
            setToken(session.access_token);
            try {
              const profile = await api.auth.getProfile();
              setUser(profile);
            } catch (err) {
              console.error('Failed to sync profile after auth change:', err);
            }
          } else if (event === 'SIGNED_OUT') {
            localStorage.removeItem('helpdesk_token');
            setToken(null);
            setUser(null);
          }
        }
      );

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (isSupabaseReady && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        if (data.session) {
          localStorage.setItem('helpdesk_token', data.session.access_token);
          setToken(data.session.access_token);
          const profile = await api.auth.getProfile();
          setUser(profile);
        }
      } else {
        // Fallback demo mode login
        const isDemoAdmin = email.toLowerCase().includes('admin');
        await loginAsDemo(isDemoAdmin ? 'admin' : 'customer');
      }
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    requestedRole: UserRole = 'customer'
  ) => {
    setLoading(true);
    try {
      if (isSupabaseReady && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: requestedRole,
            },
          },
        });

        if (error) throw error;
        if (data.session) {
          localStorage.setItem('helpdesk_token', data.session.access_token);
          setToken(data.session.access_token);
          const profile = await api.auth.getProfile();
          setUser(profile);
        }
      } else {
        // Fallback mode signup
        const fakeToken = `demo-${requestedRole}-token`;
        localStorage.setItem('helpdesk_token', fakeToken);
        setToken(fakeToken);
        setUser({
          id: `user-${Date.now()}`,
          email,
          full_name: fullName,
          role: requestedRole,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      if (isSupabaseReady && supabase) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn('Signout warning:', e);
    } finally {
      localStorage.removeItem('helpdesk_token');
      setToken(null);
      setUser(null);
    }
  };

  const resetPassword = async (email: string) => {
    if (isSupabaseReady && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
    }
  };

  const loginAsDemo = async (role: 'customer' | 'admin') => {
    setLoading(true);
    try {
      const isAdmin = role === 'admin';
      const demoToken = isAdmin ? 'demo-admin-token' : 'demo-customer-token';
      const demoUser: UserProfile = {
        id: isAdmin
          ? '00000000-0000-0000-0000-000000000002'
          : '00000000-0000-0000-0000-000000000001',
        full_name: isAdmin ? 'Sarah Jenkins (Admin)' : 'Alex Customer',
        email: isAdmin ? 'admin@helpdesk.ai' : 'customer@example.com',
        role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      localStorage.setItem('helpdesk_token', demoToken);
      setToken(demoToken);
      setUser(demoUser);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: { full_name?: string; avatar_url?: string }) => {
    const updated = await api.auth.updateProfile(data);
    setUser(updated);
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const profile = await api.auth.getProfile();
      setUser(profile);
    } catch (e) {
      console.warn('Could not refresh profile:', e);
    }
  };

  const role = user?.role || 'customer';
  const isAuthenticated = Boolean(user && token);
  const isAdmin = role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isAuthenticated,
        isAdmin,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        loginAsDemo,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


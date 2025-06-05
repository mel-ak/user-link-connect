
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  signInWithSSO: (provider: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      // Call custom SSO edge function for signup
      const { data, error } = await supabase.functions.invoke('custom-sso', {
        body: {
          action: 'signup',
          email,
          password,
          name: fullName || 'User'
        }
      });

      if (error || !data.success) {
        throw new Error(data?.error || 'Signup failed');
      }

      toast({
        title: "Success",
        description: "Account created successfully! You can now sign in.",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Signup Error",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Call custom SSO edge function for signin
      const { data, error } = await supabase.functions.invoke('custom-sso', {
        body: {
          action: 'signin',
          email,
          password
        }
      });

      if (error || !data.success) {
        throw new Error(data?.error || 'Login failed');
      }

      // Store the backend token for future API calls
      localStorage.setItem('backend_token', data.backend_token);

      // Sign in with Supabase using the session data
      const { error: supabaseError } = await supabase.auth.setSession({
        access_token: data.supabase_session.properties.access_token,
        refresh_token: data.supabase_session.properties.refresh_token
      });

      if (supabaseError) {
        throw new Error('Session creation failed');
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Login Error",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    // Clear backend token
    localStorage.removeItem('backend_token');
    
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    }
  };

  const signInWithSSO = async (provider: string) => {
    if (provider === 'custom') {
      // Redirect to custom SSO login page or show modal
      toast({
        title: "Custom SSO",
        description: "Please use the sign in form for custom backend authentication.",
      });
      return { error: null };
    }

    // Handle other SSO providers (Google, GitHub)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider as any,
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      toast({
        title: "SSO Error",
        description: error.message,
        variant: "destructive",
      });
    }

    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    signInWithSSO,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

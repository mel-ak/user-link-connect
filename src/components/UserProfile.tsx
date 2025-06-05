
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LogOut, User } from 'lucide-react';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  created_at: string;
}

interface SSOIntegration {
  id: string;
  provider: string;
  external_user_id: string;
  created_at: string;
}

export const UserProfile = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ssoIntegrations, setSsoIntegrations] = useState<SSOIntegration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchSSOIntegrations();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
    } else {
      setProfile(data);
    }
    setLoading(false);
  };

  const fetchSSOIntegrations = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('sso_integrations')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching SSO integrations:', error);
    } else {
      setSsoIntegrations(data || []);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                  <AvatarFallback>
                    {profile?.full_name ? getInitials(profile.full_name) : <User className="h-8 w-8" />}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">
                    {profile?.full_name || 'User Profile'}
                  </CardTitle>
                  <CardDescription>{profile?.email}</CardDescription>
                </div>
              </div>
              <Button onClick={signOut} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-sm">{profile?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-sm">{profile?.full_name || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Member Since</label>
                  <p className="text-sm">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">User ID</label>
                  <p className="text-sm font-mono text-xs">{user?.id}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Connected Accounts</h3>
              {ssoIntegrations.length > 0 ? (
                <div className="space-y-2">
                  {ssoIntegrations.map((integration) => (
                    <div key={integration.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant="secondary">{integration.provider}</Badge>
                        <span className="text-sm text-gray-600">
                          Connected on {new Date(integration.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 font-mono">
                        {integration.external_user_id}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No connected accounts</p>
              )}
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-gray-500">
                This profile integrates with your team's custom backend authentication system.
                SSO connections are managed automatically when you sign in through external providers.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

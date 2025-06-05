
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Shield, ExternalLink } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Our SSO Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Secure authentication with Single Sign-On integration for your team's custom backend
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card>
            <CardHeader>
              <UserPlus className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>User Registration</CardTitle>
              <CardDescription>
                Create new accounts with email verification and profile management
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <LogIn className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Secure Login</CardTitle>
              <CardDescription>
                Authenticate with email/password or social providers like Google and GitHub
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>SSO Integration</CardTitle>
              <CardDescription>
                Seamless integration with your team's custom backend authentication system
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="text-center">
          {user ? (
            <div className="space-y-4">
              <p className="text-lg text-gray-700">
                Welcome back, {user.email}!
              </p>
              <Button onClick={() => navigate('/dashboard')} size="lg">
                Go to Dashboard
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-lg text-gray-700 mb-8">
                Get started by signing in or creating a new account
              </p>
              <div className="space-y-4">
                <div className="space-x-4">
                  <Button onClick={() => navigate('/auth')} size="lg">
                    Sign In / Sign Up
                  </Button>
                </div>
                <div>
                  <Button 
                    onClick={() => navigate('/custom-sso')} 
                    variant="outline" 
                    size="lg"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Team's Custom Backend
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-16 max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-600">
                <li>• Email and password authentication</li>
                <li>• Social login with Google and GitHub</li>
                <li>• Custom SSO integration support</li>
                <li>• User profile management</li>
                <li>• Secure session handling</li>
                <li>• Row-level security for data protection</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;

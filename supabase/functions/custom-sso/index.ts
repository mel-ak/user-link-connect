
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, email, password, name } = await req.json();
    const backendBaseUrl = '192.168.244.31:4078';

    if (action === 'signup') {
      // Call your backend signup endpoint
      const signupResponse = await fetch(`http://${backendBaseUrl}/users/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name,
          roles: ['user']
        }),
      });

      if (!signupResponse.ok) {
        throw new Error('Backend signup failed');
      }

      const backendUser = await signupResponse.json();
      
      // Create user in Supabase Auth with the backend user ID
      const { data: supabaseUser, error: supabaseError } = await supabase.auth.admin.createUser({
        email,
        password,
        user_metadata: {
          full_name: name,
          backend_user_id: backendUser.id,
          roles: backendUser.roles
        },
        email_confirm: true
      });

      if (supabaseError) {
        console.error('Supabase user creation failed:', supabaseError);
        throw new Error('User creation failed');
      }

      // Store SSO integration record
      const { error: ssoError } = await supabase
        .from('sso_integrations')
        .insert({
          user_id: supabaseUser.user.id,
          provider: 'custom',
          external_user_id: backendUser.id
        });

      if (ssoError) {
        console.error('SSO integration record creation failed:', ssoError);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          user: supabaseUser.user,
          backend_user: backendUser 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'signin') {
      // Call your backend login endpoint
      const loginResponse = await fetch(`http://${backendBaseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        }),
      });

      if (!loginResponse.ok) {
        throw new Error('Backend login failed');
      }

      const { access_token } = await loginResponse.json();

      // Find the corresponding Supabase user
      const { data: users, error: findError } = await supabase.auth.admin.listUsers();
      
      if (findError) {
        throw new Error('Failed to find user');
      }

      const supabaseUser = users.users.find(user => user.email === email);
      
      if (!supabaseUser) {
        throw new Error('User not found in Supabase');
      }

      // Generate a Supabase session token
      const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: email,
      });

      if (sessionError) {
        throw new Error('Failed to generate session');
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          backend_token: access_token,
          supabase_session: sessionData,
          user: supabaseUser
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Custom SSO error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

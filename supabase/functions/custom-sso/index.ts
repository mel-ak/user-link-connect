
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, email, password, name, roles } = await req.json();
    const backendUrl = '192.168.244.31:4078';

    console.log(`Custom SSO ${action} request for email: ${email}`);

    if (action === 'signup') {
      const response = await fetch(`http://${backendUrl}/users/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name,
          roles: roles || ['user']
        }),
      });

      const data = await response.json();
      console.log('Signup response:', data);

      return new Response(
        JSON.stringify({ success: response.ok, data }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: response.ok ? 200 : 400
        }
      );
    }

    if (action === 'login') {
      const response = await fetch(`http://${backendUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();
      console.log('Login response:', data);

      return new Response(
        JSON.stringify({ success: response.ok, data }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: response.ok ? 200 : 400
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );

  } catch (error) {
    console.error('Custom SSO error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

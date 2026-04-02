import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { location_id, provider } = await req.json();

    if (!location_id || !provider) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const validProviders = ['gusto', 'adp', 'paychex'];
    if (!validProviders.includes(provider)) {
      return Response.json({ error: 'Invalid provider' }, { status: 400 });
    }

    // OAuth URLs for each provider
    const oauthUrls = {
      gusto: {
        authUrl: 'https://api.gusto.com/oauth/authorize',
        clientId: Deno.env.get('GUSTO_CLIENT_ID'),
        redirectUri: `${Deno.env.get('APP_BASE_URL')}/oauth/callback/gusto`
      },
      adp: {
        authUrl: 'https://api.adp.com/oauth/authorize',
        clientId: Deno.env.get('ADP_CLIENT_ID'),
        redirectUri: `${Deno.env.get('APP_BASE_URL')}/oauth/callback/adp`
      },
      paychex: {
        authUrl: 'https://api.paychex.com/oauth/authorize',
        clientId: Deno.env.get('PAYCHEX_CLIENT_ID'),
        redirectUri: `${Deno.env.get('APP_BASE_URL')}/oauth/callback/paychex`
      }
    };

    const config = oauthUrls[provider];
    if (!config.clientId) {
      console.error(`Missing OAuth credentials for ${provider}`);
      return Response.json({ 
        error: `${provider} OAuth not configured` 
      }, { status: 500 });
    }

    // Generate state for CSRF protection
    const state = crypto.randomUUID();
    
    // Store state temporarily (in production, use Redis or similar)
    const stateData = {
      state,
      provider,
      location_id,
      user_email: user.email,
      created_at: new Date().toISOString()
    };

    // Build authorization URL
    const authUrl = new URL(config.authUrl);
    authUrl.searchParams.append('client_id', config.clientId);
    authUrl.searchParams.append('redirect_uri', config.redirectUri);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('scope', 'payroll:read payroll:write timesheets:read');

    return Response.json({ 
      authUrl: authUrl.toString(),
      state 
    });
  } catch (error) {
    console.error('PayrollOAuth init error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
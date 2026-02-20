import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { provider } = body;

    if (!provider) {
      return Response.json({ error: 'Missing provider' }, { status: 400 });
    }

    // OAuth authorization endpoints
    const oauthAuthEndpoints = {
      gusto: 'https://api.gusto.com/oauth/authorize',
      adp: 'https://api.adp.com/oauth/authorize',
      paychex: 'https://api.paychex.com/oauth/authorize',
      bamboohr: 'https://api.bamboohr.com/login/oauth/authorize',
      rippling: 'https://api.rippling.com/oauth/authorize',
      workday: 'https://workday.okta.com/oauth2/v1/authorize'
    };

    const authEndpoint = oauthAuthEndpoints[provider];
    if (!authEndpoint) {
      return Response.json({ error: 'Invalid provider' }, { status: 400 });
    }

    const clientId = Deno.env.get(`PAYROLL_${provider.toUpperCase()}_CLIENT_ID`);
    const redirectUri = Deno.env.get('PAYROLL_REDIRECT_URI') || 'https://app.base44.com/payroll/oauth/callback';
    
    if (!clientId) {
      return Response.json(
        { error: `Missing credentials for ${provider}` },
        { status: 500 }
      );
    }

    // Generate state token for CSRF protection
    const state = crypto.getRandomValues(new Uint8Array(32));
    const stateStr = Array.from(state).map(b => b.toString(16).padStart(2, '0')).join('');

    // Build authorization URL
    const authUrl = new URL(authEndpoint);
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('state', stateStr);
    authUrl.searchParams.append('scope', 'employees:read payroll:read');

    return Response.json({
      authUrl: authUrl.toString(),
      provider
    });
  } catch (error) {
    console.error('OAuth init error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
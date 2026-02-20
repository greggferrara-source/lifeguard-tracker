import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const provider = url.searchParams.get('provider');
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (!provider || !code) {
      return Response.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // OAuth endpoints for each provider
    const oauthEndpoints = {
      gusto: 'https://api.gusto.com/oauth/token',
      adp: 'https://api.adp.com/oauth2/v1/token',
      paychex: 'https://api.paychex.com/api/oauth/token',
      bamboohr: 'https://api.bamboohr.com/login/oauth/access_token',
      rippling: 'https://api.rippling.com/oauth/token',
      workday: 'https://workday.okta.com/oauth2/v1/token'
    };

    const tokenEndpoint = oauthEndpoints[provider];
    if (!tokenEndpoint) {
      return Response.json({ error: 'Invalid provider' }, { status: 400 });
    }

    // Exchange code for access token
    const clientId = Deno.env.get(`PAYROLL_${provider.toUpperCase()}_CLIENT_ID`);
    const clientSecret = Deno.env.get(`PAYROLL_${provider.toUpperCase()}_CLIENT_SECRET`);
    const redirectUri = Deno.env.get('PAYROLL_REDIRECT_URI') || 'https://app.base44.com/payroll/oauth/callback';

    const tokenResponse = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri
      })
    });

    if (!tokenResponse.ok) {
      console.error(`Token exchange failed for ${provider}:`, await tokenResponse.text());
      return Response.json({ error: 'Token exchange failed' }, { status: 500 });
    }

    const tokenData = await tokenResponse.json();

    // Store integration in database
    const integration = await base44.entities.PayrollIntegration.create({
      provider,
      status: 'connected',
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      token_expires_at: tokenData.expires_in 
        ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
        : null
    });

    console.log(`${provider} integration created:`, integration.id);

    return Response.json({
      success: true,
      integrationId: integration.id,
      redirectUrl: '/PayrollIntegrations'
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
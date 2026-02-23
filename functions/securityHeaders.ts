// Security headers middleware - apply to all responses
export function getSecurityHeaders() {
  return {
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.stripe.com https://*.base44.app",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || 'https://lifeguardtracker.app'
  };
}

Deno.serve(async (req) => {
  const response = new Response('OK');
  const headers = getSecurityHeaders();
  
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
});
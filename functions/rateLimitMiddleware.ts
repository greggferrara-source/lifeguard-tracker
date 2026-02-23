// Rate limiting to prevent abuse
const rateLimitStore = new Map();

export async function checkRateLimit(identifier, limit = 100, windowMs = 60000) {
  const now = Date.now();
  const key = identifier;
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  const bucket = rateLimitStore.get(key);
  
  if (now > bucket.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  bucket.count++;
  
  if (bucket.count > limit) {
    return false;
  }
  
  return true;
}

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of rateLimitStore.entries()) {
    if (now > bucket.resetTime + 60000) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

Deno.serve(async (req) => {
  // Extract client IP
  const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  
  // Check rate limit (100 requests per minute per IP)
  const isAllowed = await checkRateLimit(`api_${clientIP}`, 100, 60000);
  
  if (!isAllowed) {
    return Response.json(
      { error: 'Rate limit exceeded. Too many requests.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  return Response.json({ success: true });
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Performance optimization utilities
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function getCachedData(key) {
  const cached = cache.get(key);
  if (!cached) return null;
  
  if (Date.now() > cached.expiresAt) {
    cache.delete(key);
    return null;
  }
  
  return cached.data;
}

export function setCachedData(key, data, duration = CACHE_DURATION) {
  cache.set(key, {
    data,
    expiresAt: Date.now() + duration
  });
}

// Clean up old cache entries every hour
setInterval(() => {
  const now = Date.now();
  for (const [key, cached] of cache.entries()) {
    if (now > cached.expiresAt) {
      cache.delete(key);
    }
  }
}, 60 * 60 * 1000);

export async function optimizedQuery(base44, entityName, cacheKey, queryFn) {
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const data = await queryFn();
  setCachedData(cacheKey, data);
  return data;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Example: fetch with caching
    const locations = await optimizedQuery(
      base44,
      'Location',
      'locations_list',
      () => base44.entities.Location.list()
    );

    return Response.json({
      success: true,
      data: locations,
      cached: !!getCachedData('locations_list')
    });
  } catch (error) {
    console.error('Performance optimization error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
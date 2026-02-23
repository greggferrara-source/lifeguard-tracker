import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Enhanced error handling for all backend functions
export class APIError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export async function logError(error, context = {}) {
  const errorLog = {
    timestamp: new Date().toISOString(),
    message: error.message,
    stack: error.stack,
    code: error.code || 'UNKNOWN',
    statusCode: error.statusCode || 500,
    context,
    environment: Deno.env.get('ENVIRONMENT') || 'production'
  };

  console.error(JSON.stringify(errorLog));
  
  // In production, send to error tracking service
  try {
    await fetch('https://api.example.com/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorLog)
    }).catch(() => {});
  } catch {}

  return errorLog;
}

export function createErrorResponse(error, defaultStatusCode = 500) {
  const statusCode = error.statusCode || defaultStatusCode;
  const code = error.code || 'INTERNAL_ERROR';
  
  return Response.json({
    error: {
      message: error.message,
      code,
      timestamp: new Date().toISOString()
    }
  }, { status: statusCode });
}

// Validation helper
export async function validateRequest(req, requiredFields = []) {
  if (req.method !== 'POST' && req.method !== 'PUT' && req.method !== 'PATCH') {
    throw new APIError('Method not allowed', 405, 'METHOD_NOT_ALLOWED');
  }

  let body = {};
  try {
    body = await req.json();
  } catch {
    throw new APIError('Invalid JSON', 400, 'INVALID_JSON');
  }

  for (const field of requiredFields) {
    if (!(field in body)) {
      throw new APIError(`Missing required field: ${field}`, 400, 'MISSING_FIELD');
    }
  }

  return body;
}

Deno.serve(async (req) => {
  try {
    // Example usage
    const body = await validateRequest(req, ['email', 'name']);
    return Response.json({ success: true, data: body });
  } catch (error) {
    await logError(error, { url: req.url });
    return createErrorResponse(error);
  }
});
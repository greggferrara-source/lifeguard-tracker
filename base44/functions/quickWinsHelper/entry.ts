import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { format, parseISO } from 'npm:date-fns@3.6.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, params = {} } = await req.json();
    const timestamp = new Date().toISOString();

    switch (action) {
      case 'paginatedList': {
        const { entity, filter = {}, page = 1, pageSize = 20, sort = '-created_date' } = params;
        if (!entity) {
          return Response.json({ success: false, error: { code: 'MISSING_PARAM', message: 'entity is required' }, meta: { timestamp } });
        }
        const safePageSize = Math.min(pageSize, 50);
        const skip = (page - 1) * safePageSize;

        const items = Object.keys(filter).length > 0
          ? await base44.entities[entity].filter(filter, sort, safePageSize)
          : await base44.entities[entity].list(sort, safePageSize);

        return Response.json({
          success: true,
          data: { items, page, pageSize: safePageSize, hasMore: items.length === safePageSize },
          meta: { timestamp }
        });
      }

      case 'formatDate': {
        const { date, formatStr = 'MMM d, yyyy' } = params;
        if (!date) return Response.json({ success: true, data: null, meta: { timestamp } });
        const parsed = typeof date === 'string' ? parseISO(date) : new Date(date);
        return Response.json({ success: true, data: format(parsed, formatStr), meta: { timestamp } });
      }

      case 'standardizeError': {
        const { error } = params;
        return Response.json({
          success: false,
          error: {
            code: error?.code || 'UNKNOWN_ERROR',
            message: error?.message || 'An unexpected error occurred',
            details: error?.details || null
          },
          meta: { timestamp }
        });
      }

      case 'safeInvoke': {
        const { functionName, data = {} } = params;
        if (!functionName) {
          return Response.json({ success: false, error: { code: 'MISSING_PARAM', message: 'functionName is required' }, meta: { timestamp } });
        }
        try {
          const result = await base44.functions.invoke(functionName, data);
          return Response.json({ success: true, data: result, meta: { timestamp } });
        } catch (err) {
          console.error(`safeInvoke [${functionName}] failed:`, err.message);
          return Response.json({
            success: false,
            error: { code: 'FUNCTION_ERROR', message: err.message || 'Function call failed' },
            meta: { timestamp }
          });
        }
      }

      default:
        return Response.json({
          success: false,
          error: { code: 'UNKNOWN_ACTION', message: `Unknown action: ${action}` },
          meta: { timestamp }
        }, { status: 400 });
    }
  } catch (error) {
    console.error('quickWinsHelper error:', error.message);
    return Response.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message || 'Internal server error' },
      meta: { timestamp: new Date().toISOString() }
    }, { status: 500 });
  }
});
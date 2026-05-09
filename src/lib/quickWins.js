import { base44 } from '@/api/base44Client';
import { format, parseISO } from 'date-fns';

/**
 * Fetch a paginated list of any entity (max 50 per page).
 * @param {string} entity - Entity name (e.g. 'Employee')
 * @param {object} options - { filter, page, pageSize, sort }
 * @returns {{ items, page, pageSize, hasMore }}
 */
export async function fetchPaginated(entity, { filter = {}, page = 1, pageSize = 50, sort = '-created_date' } = {}) {
  const safePageSize = Math.min(pageSize, 50);
  const items = Object.keys(filter).length > 0
    ? await base44.entities[entity].filter(filter, sort, safePageSize)
    : await base44.entities[entity].list(sort, safePageSize);

  return { items, page, pageSize: safePageSize, hasMore: items.length === safePageSize };
}

/**
 * Format a date string consistently across the app.
 * @param {string|Date} date
 * @param {string} formatStr - date-fns format string (default: 'MMM d, yyyy')
 */
export function formatDate(date, formatStr = 'MMM d, yyyy') {
  if (!date) return '—';
  try {
    const parsed = typeof date === 'string' ? parseISO(date) : new Date(date);
    return format(parsed, formatStr);
  } catch {
    return String(date);
  }
}

/**
 * Format a datetime string with time included.
 */
export function formatDateTime(date) {
  return formatDate(date, 'MMM d, yyyy h:mm a');
}

/**
 * Standardize any caught error into a consistent shape.
 * @param {any} error
 * @returns {{ code, message, details }}
 */
export function standardizeError(error) {
  return {
    code: error?.code || 'UNKNOWN_ERROR',
    message: error?.message || 'An unexpected error occurred',
    details: error?.details || null,
  };
}

/**
 * Safely invoke a backend function with automatic error handling.
 * Returns { success, data, error }.
 */
export async function safeInvoke(functionName, data = {}) {
  try {
    const result = await base44.functions.invoke(functionName, data);
    return { success: true, data: result?.data ?? result };
  } catch (error) {
    return { success: false, error: standardizeError(error) };
  }
}
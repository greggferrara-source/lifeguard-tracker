import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Centralized input validation for all endpoints
export async function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function validatePhone(phone) {
  const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

export async function validateText(text, minLength = 1, maxLength = 500) {
  if (!text || typeof text !== 'string') return false;
  const trimmed = text.trim();
  return trimmed.length >= minLength && trimmed.length <= maxLength;
}

export async function validateNumber(value, min = 0, max = Infinity) {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
}

export async function sanitizeHTML(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export async function validateDate(dateStr) {
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date.getTime());
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { type, value, options } = await req.json();

    let isValid = false;
    switch (type) {
      case 'email':
        isValid = await validateEmail(value);
        break;
      case 'phone':
        isValid = await validatePhone(value);
        break;
      case 'text':
        isValid = await validateText(value, options?.minLength, options?.maxLength);
        break;
      case 'number':
        isValid = await validateNumber(value, options?.min, options?.max);
        break;
      case 'date':
        isValid = await validateDate(value);
        break;
      default:
        return Response.json({ error: 'Unknown validation type' }, { status: 400 });
    }

    return Response.json({ valid: isValid });
  } catch (error) {
    console.error('Validation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
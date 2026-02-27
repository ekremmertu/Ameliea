/**
 * Input Sanitization Utilities
 * Protects against XSS attacks by sanitizing user input
 */

/**
 * Sanitize HTML content by removing dangerous tags and attributes
 * This is a basic implementation - for production, consider using DOMPurify
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  
  // Remove script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // Remove data: protocol (can be used for XSS)
  sanitized = sanitized.replace(/data:text\/html/gi, '');
  
  // Remove iframe, embed, object tags
  sanitized = sanitized.replace(/<(iframe|embed|object)[^>]*>.*?<\/(iframe|embed|object)>/gi, '');
  
  return sanitized.trim();
}

/**
 * Sanitize plain text by escaping HTML special characters
 */
export function sanitizeText(text: string): string {
  if (!text) return '';
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize URL to prevent javascript: and data: protocols
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';
  
  const trimmed = url.trim().toLowerCase();
  
  // Block dangerous protocols
  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('vbscript:') ||
    trimmed.startsWith('file:')
  ) {
    return '';
  }
  
  return url.trim();
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  if (!email) return '';
  
  // Basic email validation and sanitization
  const trimmed = email.trim().toLowerCase();
  
  // Remove any HTML tags
  const withoutHtml = trimmed.replace(/<[^>]*>/g, '');
  
  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(withoutHtml)) {
    return '';
  }
  
  return withoutHtml;
}

/**
 * Sanitize phone number
 */
export function sanitizePhone(phone: string): string {
  if (!phone) return '';
  
  // Remove all non-digit characters except + at the start
  let sanitized = phone.trim();
  
  // Allow + only at the start
  if (sanitized.startsWith('+')) {
    sanitized = '+' + sanitized.slice(1).replace(/[^\d]/g, '');
  } else {
    sanitized = sanitized.replace(/[^\d]/g, '');
  }
  
  return sanitized;
}

/**
 * Sanitize user-generated content (messages, notes, etc.)
 * Allows basic formatting but removes dangerous content
 */
export function sanitizeUserContent(content: string): string {
  if (!content) return '';
  
  // First, escape HTML
  let sanitized = sanitizeHtml(content);
  
  // Limit length to prevent abuse
  const MAX_LENGTH = 10000;
  if (sanitized.length > MAX_LENGTH) {
    sanitized = sanitized.substring(0, MAX_LENGTH);
  }
  
  return sanitized.trim();
}

/**
 * Sanitize object by applying appropriate sanitization to each field
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  schema: Record<keyof T, 'text' | 'html' | 'email' | 'phone' | 'url' | 'none'>
): T {
  const sanitized = { ...obj };
  
  for (const key in schema) {
    const value = obj[key];
    if (value === null || value === undefined) continue;
    
    const type = schema[key];
    
    switch (type) {
      case 'text':
        sanitized[key] = sanitizeText(String(value)) as any;
        break;
      case 'html':
        sanitized[key] = sanitizeHtml(String(value)) as any;
        break;
      case 'email':
        sanitized[key] = sanitizeEmail(String(value)) as any;
        break;
      case 'phone':
        sanitized[key] = sanitizePhone(String(value)) as any;
        break;
      case 'url':
        sanitized[key] = sanitizeUrl(String(value)) as any;
        break;
      case 'none':
        // No sanitization
        break;
    }
  }
  
  return sanitized;
}

/**
 * Validate and sanitize RSVP data
 */
export function sanitizeRsvpData(data: {
  full_name: string;
  email?: string;
  phone?: string;
  note?: string;
  [key: string]: any;
}) {
  return {
    ...data,
    full_name: sanitizeText(data.full_name),
    email: data.email ? sanitizeEmail(data.email) : undefined,
    phone: data.phone ? sanitizePhone(data.phone) : undefined,
    note: data.note ? sanitizeUserContent(data.note) : undefined,
  };
}

/**
 * Validate and sanitize love note data
 */
export function sanitizeLoveNoteData(data: {
  guest_name: string;
  guest_email?: string;
  message: string;
  [key: string]: any;
}) {
  return {
    ...data,
    guest_name: sanitizeText(data.guest_name),
    guest_email: data.guest_email ? sanitizeEmail(data.guest_email) : undefined,
    message: sanitizeUserContent(data.message),
  };
}

/**
 * Validate and sanitize testimonial data
 */
export function sanitizeTestimonialData(data: {
  name: string;
  message: string;
  [key: string]: any;
}) {
  return {
    ...data,
    name: sanitizeText(data.name),
    message: sanitizeUserContent(data.message),
  };
}

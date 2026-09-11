/**
 * Security & Sanitization Utilities
 * Protects against XSS (Cross-Site Scripting), Script Injections and SQL Injection patterns.
 */

// SQL Injection pattern blacklist
const SQL_INJECTION_PATTERN = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE|EXEC|DECLARE|SCRIPT)\b|--|\/\*|\*\/|;\s*|\bOR\b\s+['"\d\w]+=['"\d\w]+|\bAND\b\s+['"\d\w]+=['"\d\w]+)/gi;

// Dangerous HTML/Script pattern blacklist
const DANGEROUS_HTML_PATTERN = /<[^>]*>|javascript:|vbscript:|data:text\/html|onload=|onerror=|onclick=|onmouseover=/gi;

/**
 * Escapes HTML characters to prevent XSS execution
 */
export function escapeHtml(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/`/g, '&#x60;');
}

/**
 * Sanitizes generic user input:
 * - Trims whitespace
 * - Strips dangerous HTML tags and script protocols
 * - Strips hazardous SQL injection sequences
 */
export function sanitizeInput(input: string, maxLength: number = 500): string {
  if (!input || typeof input !== 'string') return '';

  let sanitized = input.trim();

  // Enforce max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }

  // Remove dangerous HTML and scripts
  sanitized = sanitized.replace(DANGEROUS_HTML_PATTERN, '');

  // Remove suspicious SQL keywords and comment markers
  sanitized = sanitized.replace(SQL_INJECTION_PATTERN, '');

  return sanitized;
}

/**
 * Validates and sanitizes an email address
 */
export function sanitizeEmail(email: string): { isValid: boolean; sanitized: string } {
  const sanitized = sanitizeInput(email, 120).toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const isValid = emailRegex.test(sanitized);
  return { isValid, sanitized };
}

/**
 * Validates and sanitizes a phone number (allowing digits, parentheses, +, -, spaces)
 */
export function sanitizePhone(phone: string): { isValid: boolean; sanitized: string } {
  const raw = sanitizeInput(phone, 30);
  // Keep only valid phone characters
  const sanitized = raw.replace(/[^\d\s()+ -]/g, '');
  const digitsOnly = sanitized.replace(/\D/g, '');
  // Valid phone usually has between 8 and 15 digits
  const isValid = digitsOnly.length >= 8 && digitsOnly.length <= 16;
  return { isValid, sanitized };
}

/**
 * Validates name (letters, spaces, accents, hyphens, min 2 chars)
 */
export function sanitizeName(name: string): { isValid: boolean; sanitized: string } {
  const sanitized = sanitizeInput(name, 80);
  const isValid = sanitized.length >= 2 && !/[<>{}[\]\\/]/g.test(sanitized);
  return { isValid, sanitized };
}

/**
 * Sanitizes message / text body
 */
export function sanitizeMessage(message: string): { isValid: boolean; sanitized: string } {
  const sanitized = sanitizeInput(message, 1500);
  const isValid = sanitized.length >= 3;
  return { isValid, sanitized };
}

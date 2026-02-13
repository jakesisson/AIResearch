// Security configuration utilities
export const API_ENDPOINTS = {
  // Frontend should never contain API keys - all sensitive operations go through backend
  BASE_URL: process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api',
  CHAT: '/ai/advanced-chat',
  OPPORTUNITIES: '/opportunities',
  AGENTS: '/ai-agents',
  WORKFLOWS: '/workflows'
} as const;

// Content Security Policy helpers
export const CSP_DIRECTIVES = {
  DEFAULT_SRC: ["'self'"],
  SCRIPT_SRC: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://replit.com"],
  STYLE_SRC: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  FONT_SRC: ["'self'", "https://fonts.gstatic.com"],
  CONNECT_SRC: ["'self'", "wss:", "ws:"],
  IMG_SRC: ["'self'", "data:", "blob:"]
} as const;

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

// Validate API responses
export function validateApiResponse(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;
  
  // Add specific validation logic as needed
  return true;
}
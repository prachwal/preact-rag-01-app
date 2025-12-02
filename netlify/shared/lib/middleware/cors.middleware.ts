/**
 * CORS Middleware
 * Cross-Origin Resource Sharing configuration
 */

import type { ExpressRequest, ExpressResponse } from '../types/router.types.ts';
import { HTTP_STATUS } from '../constants/http.constants.ts';

// CORS options interface
export interface CorsOptions {
  origin?: string | string[] | ((origin: string, callback: (err: Error | null, allow?: boolean) => void) => void);
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
  preflightContinue?: boolean;
  optionsSuccessStatus?: number;
}

/**
 * Default CORS options
 */
const defaultOptions: Required<Omit<CorsOptions, 'optionsSuccessStatus' | 'origin'>> & { 
  optionsSuccessStatus: number;
  origin: string;
} = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: [],
  credentials: false,
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: HTTP_STATUS.NO_CONTENT
};

/**
 * Create CORS middleware
 */
export function cors(options: Partial<CorsOptions> = {}): (req: ExpressRequest, res: ExpressResponse, next: () => void) => void {
  const finalOptions = { ...defaultOptions, ...options };

  return (req: ExpressRequest, res: ExpressResponse, next: () => void): void => {
    const origin = req.headers.get('origin') ?? req.headers.get('Origin');

    // Set CORS headers
    setCorsHeaders(res, finalOptions, origin);

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      if (finalOptions.preflightContinue) {
        next();
      } else {
        // Send 204 response for preflight
        res.status(HTTP_STATUS.NO_CONTENT).send('');
      }
      return;
    }

    next();
  };
}

/**
 * Set CORS headers on response
 */
function setCorsHeaders(
  res: ExpressResponse, 
  options: Required<Omit<CorsOptions, 'optionsSuccessStatus' | 'origin'>> & { 
    optionsSuccessStatus: number;
    origin: string | string[] | ((origin: string, callback: (err: Error | null, allow?: boolean) => void) => void);
  }, 
  origin?: string | null
): void {
  // Set Origin header
  if (options.origin) {
    if (typeof options.origin === 'string') {
      if (options.origin === '*') {
        // Allow all origins
        res.set('Access-Control-Allow-Origin', '*');
      } else if (origin && options.origin.includes(origin)) {
        // Allow specific origin
        res.set('Access-Control-Allow-Origin', origin);
      }
    } else if (Array.isArray(options.origin)) {
      // Array of allowed origins
      if (origin && options.origin.includes(origin)) {
        res.set('Access-Control-Allow-Origin', origin);
      } else {
        res.set('Access-Control-Allow-Origin', 'null');
      }
    }
    // Note: Function-based origin check would need async handling, skipping for simplicity
  }

  // Set credentials header
  if (options.credentials) {
    res.set('Access-Control-Allow-Credentials', 'true');
  }

  // Set methods header
  if (options.methods) {
    res.set('Access-Control-Allow-Methods', options.methods.join(', '));
  }

  // Set allowed headers
  if (options.allowedHeaders) {
    res.set('Access-Control-Allow-Headers', options.allowedHeaders.join(', '));
  }

  // Set exposed headers
  if (options.exposedHeaders && options.exposedHeaders.length > 0) {
    res.set('Access-Control-Expose-Headers', options.exposedHeaders.join(', '));
  }

  // Set max age
  if (options.maxAge) {
    res.set('Access-Control-Max-Age', String(options.maxAge));
  }
}

/**
 * Simple CORS middleware (allows all origins)
 */
export function simpleCors(): (req: ExpressRequest, res: ExpressResponse, next: () => void) => void {
  return (req: ExpressRequest, res: ExpressResponse, next: () => void): void => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    
    if (req.method === 'OPTIONS') {
      res.status(HTTP_STATUS.NO_CONTENT).send('');
      return;
    }
    
    next();
  };
}

/**
 * Secure CORS middleware with whitelist
 */
export function secureCors(allowedOrigins: string[]): (req: ExpressRequest, res: ExpressResponse, next: () => void) => void {
  return (req: ExpressRequest, res: ExpressResponse, next: () => void): void => {
    const origin = req.headers.get('origin') ?? req.headers.get('Origin');
    
    if (origin && allowedOrigins.includes(origin)) {
      res.set('Access-Control-Allow-Origin', origin);
      res.set('Access-Control-Allow-Credentials', 'true');
    }
    
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.set('Access-Control-Max-Age', '86400'); // 24 hours
    
    if (req.method === 'OPTIONS') {
      res.status(HTTP_STATUS.NO_CONTENT).send('');
      return;
    }
    
    next();
  };
}
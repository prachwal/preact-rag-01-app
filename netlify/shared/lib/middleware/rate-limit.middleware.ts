/**
 * Rate Limiting Middleware
 * Request rate limiting to prevent abuse
 */

import type { ExpressRequest, ExpressResponse } from '../types/router.types.ts';
import { HTTP_STATUS } from '../constants/http.constants.ts';

// Rate limit store interface
interface RateLimitStore {
  get(key: string): Promise<{ count: number; resetTime: number } | null>;
  set(key: string, value: { count: number; resetTime: number }, ttl: number): Promise<void>;
  increment(key: string, resetTime: number): Promise<{ count: number; resetTime: number }>;
}

// In-memory rate limit store (for demonstration)
// In production, use Redis or similar distributed store
class MemoryRateLimitStore implements RateLimitStore {
  private store = new Map<string, { count: number; resetTime: number }>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.store.entries()) {
        if (value.resetTime <= now) {
          this.store.delete(key);
        }
      }
    }, 60000); // eslint-disable-line @typescript-eslint/no-magic-numbers
  }

  async get(key: string): Promise<{ count: number; resetTime: number } | null> {
    const entry = this.store.get(key);
    if (!entry || entry.resetTime <= Date.now()) {
      return null;
    }
    return entry;
  }

  async set(key: string, value: { count: number; resetTime: number }, _ttl: number): Promise<void> {
    this.store.set(key, value);
  }

  async increment(key: string, resetTime: number): Promise<{ count: number; resetTime: number }> {
    const now = Date.now();
    const existing = this.store.get(key);
    
    if (!existing || existing.resetTime <= now) {
      // Reset or new entry
      const newEntry = { count: 1, resetTime };
      this.store.set(key, newEntry);
      return newEntry;
    }
    
    // Increment existing
    existing.count++;
    this.store.set(key, existing);
    return existing;
  }

  close(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }
}

// Rate limiting options
export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum requests per window
  message?: string;
  standardHeaders?: boolean; // Return rate limit info in `RateLimit-*` headers
  legacyHeaders?: boolean; // Disable the `X-RateLimit-*` headers
  keyGenerator?: (req: ExpressRequest) => string;
  skip?: (req: ExpressRequest) => boolean;
  onLimitReached?: (req: ExpressRequest, res: ExpressResponse, options: RateLimitOptions) => void;
  store?: RateLimitStore;
}

// Create default store
const defaultStore = new MemoryRateLimitStore();

/**
 * Create rate limiting middleware
 */
export function rateLimit(options: RateLimitOptions): (req: ExpressRequest, res: ExpressResponse, next: () => void) => void {
  const {
    windowMs,
    max,
    message = 'Too many requests, please try again later.',
    standardHeaders = true,
    legacyHeaders = false,
    keyGenerator = defaultKeyGenerator,
    skip = defaultSkip,
    onLimitReached,
    store = defaultStore
  } = options;

  return async (req: ExpressRequest, res: ExpressResponse, next: () => void): Promise<void> => {
    // Skip rate limiting if configured
    if (skip(req)) {
      next();
      return;
    }

    // Generate key for rate limiting
    const key = keyGenerator(req);
    const now = Date.now();
    const resetTime = now + windowMs;

    try {
      // Get current count
      const current = await store.get(key);
      let count = current?.count ?? 0;

      // Check if limit exceeded
      if (count >= max) {
        // Call limit reached handler
        onLimitReached?.(req, res, options);
        
        // Send rate limit response
        res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
          status: 'error',
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message,
            details: {
              limit: max,
              remaining: 0,
              resetTime: new Date(resetTime).toISOString()
            }
          },
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: (req as any).requestId ?? 'unknown',
            processingTimeMs: 0
          }
        });
        return;
      }

      // Increment counter
      const result = await store.increment(key, resetTime);
      count = result.count;

      // Set rate limit headers
      if (standardHeaders) {
        res.set('X-RateLimit-Limit', String(max));
        res.set('X-RateLimit-Remaining', String(Math.max(0, max - count)));
        res.set('X-RateLimit-Reset', String(Math.floor(resetTime / 1000)));
      }

      if (legacyHeaders) {
        res.set('X-RateLimit-Limit', String(max));
        res.set('X-RateLimit-Remaining', String(Math.max(0, max - count)));
      }

      next();
    } catch (error) {
      // If store fails, allow request (fail open)
      console.error('Rate limit store error:', error);
      next();
    }
  };
}

/**
 * Default key generator - uses IP address
 */
function defaultKeyGenerator(req: ExpressRequest): string {
  // Try to get real IP from headers (when behind proxy)
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = req.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback to a hash of the request details
  return `ip_${req.method}_${req.path}_${req.headers.get('user-agent') ?? 'unknown'}`;
}

/**
 * Default skip function - never skip
 */
function defaultSkip(_req: ExpressRequest): boolean {
  return false;
}

/**
 * Create API-specific rate limiter
 */
export function createApiRateLimiter(options: Partial<RateLimitOptions> = {}): (req: ExpressRequest, res: ExpressResponse, next: () => void) => void {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes
    message: 'API rate limit exceeded. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    ...options
  });
}

/**
 * Create strict rate limiter for sensitive endpoints
 */
export function createStrictRateLimiter(options: Partial<RateLimitOptions> = {}): (req: ExpressRequest, res: ExpressResponse, next: () => void) => void {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per 15 minutes
    message: 'Too many requests. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    ...options
  });
}

/**
 * Create user-specific rate limiter
 */
export function createUserRateLimiter(options: Partial<RateLimitOptions> = {}): (req: ExpressRequest, res: ExpressResponse, next: () => void) => void {
  return rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute
    keyGenerator: (req: ExpressRequest) => {
      // Use user ID if authenticated, otherwise use IP
      const userId = (req as any).user?.userId;
      if (userId) {
        return `user_${userId}`;
      }
      return defaultKeyGenerator(req);
    },
    ...options
  });
}

/**
 * Create IP-based rate limiter
 */
export function createIpRateLimiter(options: Partial<RateLimitOptions> = {}): (req: ExpressRequest, res: ExpressResponse, next: () => void) => void {
  return rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 requests per minute
    keyGenerator: defaultKeyGenerator,
    ...options
  });
}

/**
 * Create burst protection limiter (very strict, short window)
 */
export function createBurstProtection(options: Partial<RateLimitOptions> = {}): (req: ExpressRequest, res: ExpressResponse, next: () => void) => void {
  return rateLimit({
    windowMs: 10 * 1000, // 10 seconds
    max: 3, // 3 requests per 10 seconds
    message: 'Burst protection activated. Please slow down.',
    ...options
  });
}

// Export default instances
export const defaultRateLimiter = createApiRateLimiter();
export const strictRateLimiter = createStrictRateLimiter();
export const userRateLimiter = createUserRateLimiter();
export const ipRateLimiter = createIpRateLimiter();
export const burstProtection = createBurstProtection();
/**
 * Middleware Configuration
 * Centralized middleware setup and composition
 */

import type { ExpressRequest, ExpressResponse } from '../types/router.types.ts';
import {
  authenticate,
  requireAdmin
} from './auth.middleware.ts';
import {
  createLogger
} from './logging.middleware.ts';
import {
  validateAll,
  commonSchemas
} from './validation.middleware.ts';
import {
  asyncHandler
} from './error.middleware.ts';
import {
  cors
} from './cors.middleware.ts';
import {
  createApiRateLimiter
} from './rate-limit.middleware.ts';

// Middleware composition types
export type MiddlewareChain = (req: ExpressRequest, res: ExpressResponse, next: () => void) => void | Promise<void>;

/**
 * Pre-built middleware combinations
 */

// Authentication middleware
export const requireAuth = authenticate(true);
export const optionalAuth = authenticate(false);
export const requireAdminRole = requireAdmin();

// Validation middleware
export const validateApiRequest = validateAll({
  body: {
    userId: commonSchemas.userId,
    email: commonSchemas.email
  },
  query: {
    page: { type: 'number' as const, required: false, min: 1 },
    limit: { type: 'number' as const, required: false, min: 1, max: 100 }
  },
  params: {
    id: { type: 'string' as const, required: true, minLength: 1 }
  }
});

// Rate limiting middleware
export const apiRateLimiter = createApiRateLimiter();

// CORS middleware
export const apiCors = cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: false
});

// Async error wrapper
export const asyncMiddleware = asyncHandler;

// Standard middleware stacks
export const standardMiddlewareStack: MiddlewareChain[] = [
  apiCors,
  createLogger(),
  apiRateLimiter
];

export const authenticatedMiddlewareStack: MiddlewareChain[] = [
  apiCors,
  createLogger(),
  apiRateLimiter,
  requireAuth
];

export const adminMiddlewareStack: MiddlewareChain[] = [
  apiCors,
  createLogger(),
  apiRateLimiter,
  requireAuth,
  requireAdminRole
];

/**
 * Middleware composition helper (simplified)
 */
export function createMiddlewareChain(middlewares: MiddlewareChain[]): MiddlewareChain {
  return (req: ExpressRequest, res: ExpressResponse, next: () => void): void => {
    let index = -1;

    function dispatch(i: number): void {
      if (i <= index) {
        throw new Error('next() called multiple times');
      }
      index = i;

      const middleware = middlewares[i] || next;
      const result = middleware(req, res, () => {
        dispatch(i + 1);
      });

      // Handle async middleware
      if (result && typeof result.then === 'function') {
        result.catch((error) => {
          console.error('Middleware error:', error);
        });
      }
    }

    dispatch(0);
  };
}

/**
 * Apply middleware chain to router
 */
export function applyMiddlewareChain(router: any, middlewares: MiddlewareChain[]): void {
  for (const middleware of middlewares) {
    router.use(middleware);
  }
}

/**
 * Get environment-specific middleware stack
 */
export function getMiddlewareStack(environment: 'development' | 'production' | 'test' = 'development'): MiddlewareChain[] {
  switch (environment) {
    case 'production':
      return [
        apiCors,
        createLogger({ logLevel: 'warn' }),
        apiRateLimiter
      ];
    case 'test':
      return [
        apiCors
      ];
    default: // development
      return [
        apiCors,
        createLogger({ 
          includeHeaders: true, 
          includeResponse: true, 
          includeRequestBody: true,
          prettyPrint: true 
        }),
        apiRateLimiter
      ];
  }
}
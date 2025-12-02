/**
 * Middleware Configuration Tests
 * Comprehensive test coverage for middleware setup and composition
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ExpressRequest, ExpressResponse, MiddlewareChain } from '../types/router.types.ts';
import {
  requireAuth,
  optionalAuth,
  requireAdminRole,
  validateApiRequest,
  apiRateLimiter,
  apiCors,
  asyncMiddleware,
  standardMiddlewareStack,
  authenticatedMiddlewareStack,
  adminMiddlewareStack,
  createMiddlewareChain,
  applyMiddlewareChain,
  getMiddlewareStack,
} from './middleware.config';

describe('Middleware Configuration', () => {
  let mockRequest: ExpressRequest;
  let mockResponse: ExpressResponse;
  let mockNext: () => void;

  beforeEach(() => {
    mockRequest = {
      method: 'GET',
      path: '/api/test',
      headers: new Headers(),
      url: '/api/test',
      query: {},
      params: {},
      body: null,
      originalRequest: new Request('http://example.com/api/test'),
    } as ExpressRequest;
    
    mockResponse = {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
      setHeader: vi.fn().mockReturnThis(),
      _sent: false,
      _body: '',
    } as ExpressResponse;
    
    mockNext = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Pre-built middleware', () => {
    it('should export requireAuth middleware', () => {
      expect(requireAuth).toBeDefined();
      expect(typeof requireAuth).toBe('function');
    });

    it('should export optionalAuth middleware', () => {
      expect(optionalAuth).toBeDefined();
      expect(typeof optionalAuth).toBe('function');
    });

    it('should export requireAdminRole middleware', () => {
      expect(requireAdminRole).toBeDefined();
      expect(typeof requireAdminRole).toBe('function');
    });

    it('should export validateApiRequest middleware', () => {
      expect(validateApiRequest).toBeDefined();
      expect(typeof validateApiRequest).toBe('function');
    });

    it('should export apiRateLimiter middleware', () => {
      expect(apiRateLimiter).toBeDefined();
      expect(typeof apiRateLimiter).toBe('function');
    });

    it('should export apiCors middleware', () => {
      expect(apiCors).toBeDefined();
      expect(typeof apiCors).toBe('function');
    });

    it('should export asyncMiddleware', () => {
      expect(asyncMiddleware).toBeDefined();
      expect(typeof asyncMiddleware).toBe('function');
    });
  });

  describe('Middleware stacks', () => {
    it('should have standard middleware stack', () => {
      expect(standardMiddlewareStack).toBeDefined();
      expect(Array.isArray(standardMiddlewareStack)).toBe(true);
      expect(standardMiddlewareStack).toHaveLength(3); // CORS, Logger, Rate Limiter
    });

    it('should have authenticated middleware stack', () => {
      expect(authenticatedMiddlewareStack).toBeDefined();
      expect(Array.isArray(authenticatedMiddlewareStack)).toBe(true);
      expect(authenticatedMiddlewareStack).toHaveLength(4); // CORS, Logger, Rate Limiter, Auth
    });

    it('should have admin middleware stack', () => {
      expect(adminMiddlewareStack).toBeDefined();
      expect(Array.isArray(adminMiddlewareStack)).toBe(true);
      expect(adminMiddlewareStack).toHaveLength(5); // CORS, Logger, Rate Limiter, Auth, Admin
    });

    it('should have correct middleware order in stacks', () => {
      // Standard stack should start with CORS
      expect(standardMiddlewareStack[0]).toBe(apiCors);
      
      // Authenticated stack should have auth middleware at the end
      expect(authenticatedMiddlewareStack[authenticatedMiddlewareStack.length - 1]).toBe(requireAuth);
      
      // Admin stack should have admin role middleware at the end
      expect(adminMiddlewareStack[adminMiddlewareStack.length - 1]).toBe(requireAdminRole);
    });
  });

  describe('createMiddlewareChain', () => {
    it('should create middleware chain that executes in order', async () => {
      const executedOrder: string[] = [];
      
      const middleware1 = (_req: ExpressRequest, _res: ExpressResponse, next: () => void) => {
        executedOrder.push('middleware1');
        next();
      };
      
      const middleware2 = (_req: ExpressRequest, _res: ExpressResponse, next: () => void) => {
        executedOrder.push('middleware2');
        next();
      };
      
      const middleware3 = (_req: ExpressRequest, _res: ExpressResponse, next: () => void) => {
        executedOrder.push('middleware3');
        next();
      };

      const chain = createMiddlewareChain([middleware1, middleware2, middleware3]);
      chain(mockRequest, mockResponse, mockNext);

      expect(executedOrder).toEqual(['middleware1', 'middleware2', 'middleware3']);
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should stop execution if middleware throws error', () => {
      const error = new Error('Test error');
      const middleware1 = (_req: ExpressRequest, _res: ExpressResponse, next: () => void) => {
        next();
      };
      
      const middleware2 = (_req: ExpressRequest, _res: ExpressResponse, _next: () => void) => {
        throw error;
      };
      
      const middleware3 = (_req: ExpressRequest, _res: ExpressResponse, _next: () => void) => {
        // This should not be called
      };

      const chain = createMiddlewareChain([middleware1, middleware2, middleware3]);
      
      expect(() => {
        chain(mockRequest, mockResponse, mockNext);
      }).toThrow(error);
    });

    it('should prevent multiple next() calls', () => {
      const middleware1 = (_req: ExpressRequest, _res: ExpressResponse, next: () => void) => {
        next();
        next(); // This should throw
      };
      
      const chain = createMiddlewareChain([middleware1]);
      
      expect(() => {
        chain(mockRequest, mockResponse, mockNext);
      }).toThrow('next() called multiple times');
    });

    it('should work with empty middleware array', () => {
      const chain = createMiddlewareChain([]);
      chain(mockRequest, mockResponse, mockNext);
      
      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });

  describe('applyMiddlewareChain', () => {
    it('should apply middleware to router', () => {
      const mockRouter = {
        use: vi.fn(),
      };
      
      const middleware1 = (_req: ExpressRequest, _res: ExpressResponse, next: () => void) => next();
      const middleware2 = (_req: ExpressRequest, _res: ExpressResponse, next: () => void) => next();
      
      applyMiddlewareChain(mockRouter, [middleware1, middleware2]);
      
      expect(mockRouter.use).toHaveBeenCalledTimes(2);
      expect(mockRouter.use).toHaveBeenCalledWith(middleware1);
      expect(mockRouter.use).toHaveBeenCalledWith(middleware2);
    });

    it('should handle empty middleware array', () => {
      const mockRouter = {
        use: vi.fn(),
      };
      
      applyMiddlewareChain(mockRouter, []);
      
      expect(mockRouter.use).not.toHaveBeenCalled();
    });
  });

  describe('getMiddlewareStack', () => {
    it('should return development stack by default', () => {
      const stack = getMiddlewareStack('development');
      
      expect(stack).toBeDefined();
      expect(Array.isArray(stack)).toBe(true);
      expect(stack).toHaveLength(3);
    });

    it('should return production stack', () => {
      const stack = getMiddlewareStack('production');
      
      expect(stack).toBeDefined();
      expect(Array.isArray(stack)).toBe(true);
      expect(stack).toHaveLength(3);
    });

    it('should return test stack', () => {
      const stack = getMiddlewareStack('test');
      
      expect(stack).toBeDefined();
      expect(Array.isArray(stack)).toBe(true);
      expect(stack).toHaveLength(1); // Only CORS in test
    });

    it('should return different stacks for different environments', () => {
      const devStack = getMiddlewareStack('development');
      const prodStack = getMiddlewareStack('production');
      const testStack = getMiddlewareStack('test');
      
      // Test stack should be different (shorter)
      expect(testStack.length).toBeLessThan(devStack.length);
      expect(testStack.length).toBeLessThan(prodStack.length);
    });

    it('should handle unknown environment gracefully', () => {
      const stack = getMiddlewareStack('unknown' as any);
      
      expect(stack).toBeDefined();
      expect(Array.isArray(stack)).toBe(true);
      // Should default to development stack
      expect(stack).toHaveLength(3);
    });
  });

  describe('Middleware Chain Types', () => {
    it('should have correct MiddlewareChain type', () => {
      const middleware: MiddlewareChain = (req, res, next) => {
        next();
      };
      
      expect(typeof middleware).toBe('function');
    });

    it('should accept MiddlewareChain in createMiddlewareChain', () => {
      const middleware: MiddlewareChain = (req, res, next) => {
        next();
      };
      
      const chain = createMiddlewareChain([middleware]);
      expect(chain).toBeDefined();
      expect(typeof chain).toBe('function');
    });
  });

  describe('Integration Tests', () => {
    it('should work with real middleware configuration', () => {
      // Test that pre-configured middleware actually works
      const middleware = standardMiddlewareStack[0]; // CORS middleware
      
      expect(() => {
        middleware(mockRequest, mockResponse, mockNext);
      }).not.toThrow();
      
      expect(mockNext).toHaveBeenCalled();
    });

    it('should compose multiple middleware stacks correctly', () => {
      const stack1 = getMiddlewareStack('development');
      const stack2 = getMiddlewareStack('production');
      
      // Both should be arrays of functions
      stack1.forEach(middleware => {
        expect(typeof middleware).toBe('function');
      });
      
      stack2.forEach(middleware => {
        expect(typeof middleware).toBe('function');
      });
      
      // But may have different lengths or configurations
      expect(stack1.length).toBeGreaterThan(0);
      expect(stack2.length).toBeGreaterThan(0);
    });

    it('should handle middleware that modifies request/response', () => {
      let middlewareCalled = false;
      const customMiddleware = (_req: ExpressRequest, _res: ExpressResponse, next: () => void) => {
        middlewareCalled = true;
        next();
      };
      
      const chain = createMiddlewareChain([customMiddleware]);
      chain(mockRequest, mockResponse, mockNext);
      
      expect(middlewareCalled).toBe(true);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Performance Considerations', () => {
    it('should handle large middleware chains efficiently', () => {
      let executionCount = 0;
      const largeStack = Array.from({ length: 100 }, () => {
        return (_req: ExpressRequest, _res: ExpressResponse, next: () => void) => {
          executionCount++;
          next();
        };
      });
      
      const startTime = performance.now();
      const chain = createMiddlewareChain(largeStack);
      chain(mockRequest, mockResponse, mockNext);
      const endTime = performance.now();
      
      expect(mockNext).toHaveBeenCalled();
      expect(executionCount).toBe(100);
      
      // Should complete in reasonable time (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should handle async middleware correctly', async () => {
      const executionOrder: string[] = [];
      
      const asyncMiddleware1 = async (_req: ExpressRequest, _res: ExpressResponse, next: () => void) => {
        executionOrder.push('async1-start');
        await new Promise(resolve => setTimeout(resolve, 10));
        executionOrder.push('async1-end');
        next();
      };
      
      const asyncMiddleware2 = async (_req: ExpressRequest, _res: ExpressResponse, next: () => void) => {
        executionOrder.push('async2-start');
        await new Promise(resolve => setTimeout(resolve, 10));
        executionOrder.push('async2-end');
        next();
      };
      
      const chain = createMiddlewareChain([asyncMiddleware1, asyncMiddleware2]);
      
      // Start the chain (it returns void, not a Promise)
      chain(mockRequest, mockResponse, mockNext);
      
      // Wait for async operations to complete
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Verify async middleware was executed
      expect(executionOrder).toContain('async1-start');
      expect(executionOrder).toContain('async2-start');
    });
  });
});
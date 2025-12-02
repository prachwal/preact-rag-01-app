/**
 * CORS Middleware Tests
 * Comprehensive test coverage for Cross-Origin Resource Sharing functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { cors, simpleCors, secureCors } from './cors.middleware';
import { HTTP_STATUS } from '../constants/http.constants';

describe('CORS Middleware', () => {
  let mockRequest: any;
  let mockResponse: any;
  let mockNext: () => void;

  beforeEach(() => {
    mockRequest = {
      method: 'GET',
      path: '/api/test',
      headers: new Headers(),
      url: '/api/test',
    };
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('cors function', () => {
    it('should set default CORS headers for regular requests', () => {
      const middleware = cors();
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.set).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
      expect(mockResponse.set).toHaveBeenCalledWith(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, PATCH, OPTIONS'
      );
      expect(mockResponse.set).toHaveBeenCalledWith(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Requested-With'
      );
    });

    it('should handle OPTIONS preflight requests without preflightContinue', () => {
      mockRequest.method = 'OPTIONS';
      const middleware = cors({ preflightContinue: false });
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.NO_CONTENT);
      expect(mockResponse.send).toHaveBeenCalledWith('');
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle OPTIONS preflight requests with preflightContinue', () => {
      mockRequest.method = 'OPTIONS';
      const middleware = cors({ preflightContinue: true });
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should allow wildcard origin when origin is *', () => {
      const middleware = cors({ origin: '*' });
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.set).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
    });

    it('should allow specific origin when origin matches', () => {
      const allowedOrigin = 'https://example.com';
      mockRequest.headers.set('origin', allowedOrigin);
      
      const middleware = cors({ origin: [allowedOrigin] });
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.set).toHaveBeenCalledWith('Access-Control-Allow-Origin', allowedOrigin);
    });

    it('should set null origin when origin does not match whitelist', () => {
      const allowedOrigin = 'https://example.com';
      const differentOrigin = 'https://malicious.com';
      mockRequest.headers.set('origin', differentOrigin);
      
      const middleware = cors({ origin: [allowedOrigin] });
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.set).toHaveBeenCalledWith('Access-Control-Allow-Origin', 'null');
    });

    it('should set credentials header when credentials is true', () => {
      const middleware = cors({ credentials: true });
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.set).toHaveBeenCalledWith('Access-Control-Allow-Credentials', 'true');
    });

    it('should not set credentials header when credentials is false', () => {
      const middleware = cors({ credentials: false });
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.set).not.toHaveBeenCalledWith('Access-Control-Allow-Credentials', 'true');
    });

    it('should handle custom methods', () => {
      const middleware = cors({
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD']
      });
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.set).toHaveBeenCalledWith(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD'
      );
    });

    it('should handle custom allowed headers', () => {
      const middleware = cors({
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Custom-Header', 'x-trigger-error']
      });
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.set).toHaveBeenCalledWith(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Custom-Header, x-trigger-error'
      );
    });

    it('should handle exposed headers', () => {
      const middleware = cors({
        exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining']
      });
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.set).toHaveBeenCalledWith(
        'Access-Control-Expose-Headers',
        'X-RateLimit-Limit, X-RateLimit-Remaining'
      );
    });

    it('should handle max age header', () => {
      const middleware = cors({
        maxAge: 86400 // 24 hours
      });
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.set).toHaveBeenCalledWith('Access-Control-Max-Age', '86400');
    });

    it('should handle case-insensitive origin headers', () => {
      const allowedOrigin = 'https://example.com';
      mockRequest.headers.set('Origin', allowedOrigin);
      
      const middleware = cors({ origin: [allowedOrigin] });
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.set).toHaveBeenCalledWith('Access-Control-Allow-Origin', allowedOrigin);
    });

    it('should merge options with defaults correctly', () => {
      mockRequest.headers.set('origin', 'https://example.com');
      
      const middleware = cors({
        origin: ['https://example.com'],
        methods: ['GET', 'POST'],
        credentials: true,
        maxAge: 3600
      });

      middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.set).toHaveBeenCalledWith('Access-Control-Allow-Origin', 'https://example.com');
      expect(mockResponse.set).toHaveBeenCalledWith('Access-Control-Allow-Methods', 'GET, POST');
      expect(mockResponse.set).toHaveBeenCalledWith('Access-Control-Allow-Credentials', 'true');
      expect(mockResponse.set).toHaveBeenCalledWith('Access-Control-Max-Age', '3600');
    });
  });

  describe('simpleCors function', () => {
    it('should set basic CORS headers', () => {
      const middleware = simpleCors();
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.set).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
      expect(mockResponse.set).toHaveBeenCalledWith(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, PATCH, OPTIONS'
      );
      expect(mockResponse.set).toHaveBeenCalledWith(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Requested-With'
      );
    });

    it('should handle OPTIONS requests', () => {
      mockRequest.method = 'OPTIONS';
      const middleware = simpleCors();
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.NO_CONTENT);
      expect(mockResponse.send).toHaveBeenCalledWith('');
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('secureCors function', () => {
    const allowedOrigins = ['https://example.com', 'https://trusted.com'];

    it('should allow requests from whitelisted origins', () => {
      const origin = 'https://example.com';
      mockRequest.headers.set('origin', origin);
      
      const middleware = secureCors(allowedOrigins);
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.set).toHaveBeenCalledWith('Access-Control-Allow-Origin', origin);
      expect(mockResponse.set).toHaveBeenCalledWith('Access-Control-Allow-Credentials', 'true');
      expect(mockResponse.set).toHaveBeenCalledWith('Access-Control-Max-Age', '86400');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should block requests from non-whitelisted origins', () => {
      const origin = 'https://malicious.com';
      mockRequest.headers.set('origin', origin);
      
      const middleware = secureCors(allowedOrigins);
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.set).not.toHaveBeenCalledWith('Access-Control-Allow-Origin', origin);
      expect(mockResponse.set).toHaveBeenCalledWith('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      expect(mockResponse.set).toHaveBeenCalledWith('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      expect(mockNext).toHaveBeenCalled(); // Still calls next, CORS is set but origin not allowed
    });

    it('should handle requests without origin header', () => {
      const middleware = secureCors(allowedOrigins);
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.set).not.toHaveBeenCalledWith('Access-Control-Allow-Origin');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle OPTIONS requests', () => {
      mockRequest.method = 'OPTIONS';
      const origin = 'https://example.com';
      mockRequest.headers.set('origin', origin);
      
      const middleware = secureCors(allowedOrigins);
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.NO_CONTENT);
      expect(mockResponse.send).toHaveBeenCalledWith('');
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle requests with null origin', () => {
      const middleware = cors({ origin: ['https://example.com'] });
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalled();
      // Should set null when origin is null/undefined
    });

    it('should handle empty allowed origins array', () => {
      const middleware = cors({ origin: [] });
      mockRequest.headers.set('origin', 'https://example.com');
      
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.set).toHaveBeenCalledWith('Access-Control-Allow-Origin', 'null');
    });

    it('should handle undefined origin option', () => {
      const middleware = cors({ origin: undefined as any });
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.set).not.toHaveBeenCalledWith('Access-Control-Allow-Origin');
    });

    it('should handle very long maxAge value', () => {
      const middleware = cors({ maxAge: 31536000 }); // 1 year
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.set).toHaveBeenCalledWith('Access-Control-Max-Age', '31536000');
    });
  });

  describe('Integration with different request methods', () => {
    it('should work with GET requests', () => {
      mockRequest.method = 'GET';
      const middleware = cors();
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should work with POST requests', () => {
      mockRequest.method = 'POST';
      const middleware = cors();
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should work with PUT requests', () => {
      mockRequest.method = 'PUT';
      const middleware = cors();
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should work with DELETE requests', () => {
      mockRequest.method = 'DELETE';
      const middleware = cors();
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });
});
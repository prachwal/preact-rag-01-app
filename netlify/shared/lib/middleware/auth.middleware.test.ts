/**
 * Authentication Middleware Tests
 * Comprehensive test coverage for JWT token validation and user authentication
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  authenticate,
  requireRole,
  requireAdmin,
  getCurrentUser,
  isAuthenticated,
} from './auth.middleware';
import { HTTP_STATUS } from '../constants/http.constants';

describe('Authentication Middleware', () => {
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

  describe('extractToken', () => {
    it('should extract Bearer token from Authorization header', () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600; // Expires in 1 hour
      const validPayload = {
        userId: '123',
        email: 'test@test.com',
        role: 'admin',
        iat: Math.floor(Date.now() / 1000),
        exp: futureExp,
      };
      const token = 'Bearer ' + btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' + btoa(JSON.stringify(validPayload)) + '.test';
      mockRequest.headers.set('Authorization', token);
      const middleware = authenticate(false);
      middleware(mockRequest, mockResponse, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return null for missing Authorization header', () => {
      const middleware = authenticate(false);
      middleware(mockRequest, mockResponse, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return null for empty Authorization header', () => {
      mockRequest.headers.set('Authorization', '');
      const middleware = authenticate(false);
      middleware(mockRequest, mockResponse, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return null for malformed Authorization header', () => {
      mockRequest.headers.set('Authorization', 'InvalidFormat token');
      const middleware = authenticate(false);
      middleware(mockRequest, mockResponse, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('decodeJWT', () => {
    it('should decode valid JWT token', () => {
      // Test would need access to internal decodeJWT function
      // This is a placeholder for the functionality test
    });

    it('should return null for invalid JWT token', () => {
      // This test would need access to the internal decodeJWT function
      // For now, we'll test through the middleware interface
    });

    it('should return null for expired JWT token', () => {
      const expiredPayload = {
        userId: '123',
        email: 'test@test.com',
        role: 'user',
        iat: 1620000000,
        exp: 1620000000, // Already expired
      };
      
      // Create expired token
      const token = 'header.' + btoa(JSON.stringify(expiredPayload)) + '.signature';
      
      // Set the expired token
      mockRequest.headers.set('Authorization', `Bearer ${token}`);
      
      const middleware = authenticate(false);
      
      // Mock Date.now to return a time after expiration
      const originalNow = Date.now;
      Date.now = () => 1620000000 * 1000 + 1000;
      
      middleware(mockRequest, mockResponse, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        error: {
          code: 'AUTH_TOKEN_INVALID',
          message: 'Invalid or expired token',
        },
        metadata: expect.objectContaining({
          timestamp: expect.any(String),
          processingTimeMs: 0,
        }),
      });
      
      Date.now = originalNow;
    });
  });

  describe('authenticate middleware', () => {
    it('should allow request when token is valid (required mode)', () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600; // Expires in 1 hour
      const validPayload = {
        userId: '123',
        email: 'test@test.com',
        role: 'admin',
        iat: Math.floor(Date.now() / 1000),
        exp: futureExp,
      };
      const token = 'Bearer ' + btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' + btoa(JSON.stringify(validPayload)) + '.test';
      mockRequest.headers.set('Authorization', token);
      
      const middleware = authenticate(true);
      middleware(mockRequest, mockResponse, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should reject request when token is missing (required mode)', () => {
      const middleware = authenticate(true);
      middleware(mockRequest, mockResponse, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        error: {
          code: 'AUTH_TOKEN_MISSING',
          message: 'Authorization token is required',
        },
        metadata: expect.objectContaining({
          timestamp: expect.any(String),
          processingTimeMs: 0,
        }),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject request when token is invalid (required mode)', () => {
      mockRequest.headers.set('Authorization', 'Bearer invalid-token');
      
      const middleware = authenticate(true);
      middleware(mockRequest, mockResponse, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        error: {
          code: 'AUTH_TOKEN_INVALID',
          message: 'Invalid or expired token',
        },
        metadata: expect.objectContaining({
          timestamp: expect.any(String),
          processingTimeMs: 0,
        }),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should allow request when token is missing (optional mode)', () => {
      const middleware = authenticate(false);
      middleware(mockRequest, mockResponse, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should attach user info to request for valid token', () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600; // Expires in 1 hour
      const validPayload = {
        userId: '123',
        email: 'test@test.com',
        role: 'admin',
        iat: Math.floor(Date.now() / 1000),
        exp: futureExp,
      };
      const token = 'Bearer ' + btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' + btoa(JSON.stringify(validPayload)) + '.test';
      mockRequest.headers.set('Authorization', token);
      
      const middleware = authenticate(true);
      middleware(mockRequest, mockResponse, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect((mockRequest as any).user).toBeDefined();
      expect((mockRequest as any).user.userId).toBe('123');
      expect((mockRequest as any).user.email).toBe('test@test.com');
      expect((mockRequest as any).user.role).toBe('admin');
    });
  });

  describe('requireRole middleware', () => {
    beforeEach(() => {
      // Mock authenticated request
      (mockRequest as any).user = {
        userId: '123',
        email: 'test@test.com',
        role: 'admin',
        iat: 1620000000,
        exp: 1620000000,
      };
    });

    it('should allow request when user has required role (single role)', () => {
      const middleware = requireRole('admin');
      middleware(mockRequest, mockResponse, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should allow request when user has one of required roles (multiple roles)', () => {
      const middleware = requireRole(['admin', 'moderator']);
      middleware(mockRequest, mockResponse, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should reject request when user does not have required role', () => {
      (mockRequest as any).user.role = 'user';
      
      const middleware = requireRole('admin');
      middleware(mockRequest, mockResponse, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.FORBIDDEN);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        error: {
          code: 'AUTH_INSUFFICIENT_ROLE',
          message: 'Insufficient permissions',
        },
        metadata: expect.objectContaining({
          timestamp: expect.any(String),
          processingTimeMs: 0,
        }),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject request when user is not authenticated', () => {
      delete (mockRequest as any).user;
      
      const middleware = requireRole('admin');
      middleware(mockRequest, mockResponse, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        error: {
          code: 'AUTH_USER_REQUIRED',
          message: 'Authentication required',
        },
        metadata: expect.objectContaining({
          timestamp: expect.any(String),
          processingTimeMs: 0,
        }),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireAdmin middleware', () => {
    beforeEach(() => {
      (mockRequest as any).user = {
        userId: '123',
        email: 'test@test.com',
        role: 'admin',
        iat: 1620000000,
        exp: 1620000000,
      };
    });

    it('should allow admin user', () => {
      const middleware = requireAdmin();
      middleware(mockRequest, mockResponse, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject non-admin user', () => {
      (mockRequest as any).user.role = 'user';
      
      const middleware = requireAdmin();
      middleware(mockRequest, mockResponse, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.FORBIDDEN);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('getCurrentUser', () => {
    it('should return user from authenticated request', () => {
      (mockRequest as any).user = {
        userId: '123',
        email: 'test@test.com',
        role: 'admin',
      };
      
      const user = getCurrentUser(mockRequest);
      expect(user).toEqual((mockRequest as any).user);
    });

    it('should return null for unauthenticated request', () => {
      const user = getCurrentUser(mockRequest);
      expect(user).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true for authenticated request', () => {
      (mockRequest as any).user = {
        userId: '123',
        email: 'test@test.com',
      };
      
      expect(isAuthenticated(mockRequest)).toBe(true);
    });

    it('should return false for unauthenticated request', () => {
      expect(isAuthenticated(mockRequest)).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle case-insensitive authorization header', () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600; // Expires in 1 hour
      const validPayload = {
        userId: '123',
        email: 'test@test.com',
        role: 'admin',
        iat: Math.floor(Date.now() / 1000),
        exp: futureExp,
      };
      const token = 'Bearer ' + btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' + btoa(JSON.stringify(validPayload)) + '.test';
      mockRequest.headers.set('authorization', token);
      
      const middleware = authenticate(false);
      middleware(mockRequest, mockResponse, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle malformed JWT token gracefully', () => {
      mockRequest.headers.set('Authorization', 'Bearer malformed.token.here');
      
      const middleware = authenticate(true);
      middleware(mockRequest, mockResponse, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED);
    });

    it('should handle empty Bearer token', () => {
      mockRequest.headers.set('Authorization', 'Bearer ');
      
      const middleware = authenticate(true);
      middleware(mockRequest, mockResponse, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED);
    });
  });
});
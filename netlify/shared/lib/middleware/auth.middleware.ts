/**
 * Authentication Middleware
 * Handles JWT token validation and user authentication
 */

import type { ExpressRequest, ExpressResponse } from '../types/router.types.ts';
import { HTTP_STATUS } from '../constants/http.constants.ts';

// JWT token interface
interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// Extended request interface with user information
interface AuthenticatedRequest extends ExpressRequest {
  user?: JWTPayload;
}



/**
 * Decode and validate JWT token
 */
function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    const EXPECTED_PARTS = 3;
    const PAYLOAD_INDEX = 1;
    const MILLISECONDS_MULTIPLIER = 1000;
    
    if (parts.length !== EXPECTED_PARTS) {
      return null;
    }

    const payload = JSON.parse(atob(parts[PAYLOAD_INDEX]));
    
    // Check if token is expired
    if (payload.exp && typeof payload.exp === 'number' && Date.now() >= payload.exp * MILLISECONDS_MULTIPLIER) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Extract JWT token from Authorization header
 */
function extractToken(request: ExpressRequest): string | null {
  const authHeader = request.headers.get('Authorization') ?? request.headers.get('authorization');
  
  if (!authHeader?.trim()) {
    return null;
  }

  const parts = authHeader.split(' ');
  const EXPECTED_PARTS = 2;
  const BEARER_PREFIX = 'Bearer';
  const TOKEN_INDEX = 1;
  
  if (parts.length === EXPECTED_PARTS && parts[0] === BEARER_PREFIX) {
    return parts[TOKEN_INDEX] ?? null;
  }

  return null;
}

/**
 * Authentication middleware factory
 */
export function authenticate(required = true): (req: ExpressRequest, res: ExpressResponse, next: () => void) => void {
  return (req: ExpressRequest, res: ExpressResponse, next: () => void): void => {
    const token = extractToken(req);
    
    if (!token) {
      if (required) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          status: 'error',
          error: {
            code: 'AUTH_TOKEN_MISSING',
            message: 'Authorization token is required',
          },
          metadata: {
            timestamp: new Date().toISOString(),
            processingTimeMs: 0,
          },
        });
        return;
      }
      
      // Optional auth - proceed without user info
      next();
      return;
    }

    const payload = decodeJWT(token);
    
    if (!payload) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: 'error',
        error: {
          code: 'AUTH_TOKEN_INVALID',
          message: 'Invalid or expired token',
        },
        metadata: {
          timestamp: new Date().toISOString(),
          processingTimeMs: 0,
        },
      });
      return;
    }

    // Attach user info to request
    const authenticatedReq = req as AuthenticatedRequest;
    authenticatedReq.user = payload;
    
    next();
  };
}

/**
 * Role-based authorization middleware
 */
export function requireRole(roles: string | string[]): (req: ExpressRequest, res: ExpressResponse, next: () => void) => void {
  return (req: ExpressRequest, res: ExpressResponse, next: () => void): void => {
    const authenticatedReq = req as AuthenticatedRequest;
    const user = authenticatedReq.user;
    
    if (!user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: 'error',
        error: {
          code: 'AUTH_USER_REQUIRED',
          message: 'Authentication required',
        },
        metadata: {
          timestamp: new Date().toISOString(),
          processingTimeMs: 0,
        },
      });
      return;
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(user.role)) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        status: 'error',
        error: {
          code: 'AUTH_INSUFFICIENT_ROLE',
          message: 'Insufficient permissions',
        },
        metadata: {
          timestamp: new Date().toISOString(),
          processingTimeMs: 0,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Admin-only middleware
 */
export function requireAdmin(): (req: ExpressRequest, res: ExpressResponse, next: () => void) => void {
  return requireRole('admin');
}

/**
 * Get current user from request
 */
export function getCurrentUser(req: ExpressRequest): JWTPayload | null {
  const authenticatedReq = req as AuthenticatedRequest;
  return authenticatedReq.user ?? null;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(req: ExpressRequest): boolean {
  return getCurrentUser(req) !== null;
}
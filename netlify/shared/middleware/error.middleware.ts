/**
 * Error Handling Middleware
 * Centralized error handling and response formatting
 */

import type { ExpressRequest, ExpressResponse } from '../types/router.types.ts';
import { HTTP_STATUS, type HttpStatusCode } from '../constants/http.constants.ts';
import { redactBodyFields } from './logging.middleware.ts';

// Error types
export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  isOperational?: boolean;
  details?: Record<string, unknown>;
}

// Custom error classes
export class ValidationError extends Error implements AppError {
  statusCode = HTTP_STATUS.BAD_REQUEST;
  code = 'VALIDATION_ERROR';
  isOperational = true;

  constructor(message: string, public details?: Record<string, unknown>) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error implements AppError {
  statusCode = HTTP_STATUS.UNAUTHORIZED;
  code = 'AUTHENTICATION_ERROR';
  isOperational = true;

  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error implements AppError {
  statusCode = HTTP_STATUS.FORBIDDEN;
  code = 'AUTHORIZATION_ERROR';
  isOperational = true;

  constructor(message: string = 'Insufficient permissions') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends Error implements AppError {
  statusCode = HTTP_STATUS.NOT_FOUND;
  code = 'NOT_FOUND';
  isOperational = true;

  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error implements AppError {
  statusCode = HTTP_STATUS.CONFLICT;
  code = 'CONFLICT';
  isOperational = true;

  constructor(message: string = 'Resource conflict') {
    super(message);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends Error implements AppError {
  statusCode = HTTP_STATUS.TOO_MANY_REQUESTS;
  code = 'RATE_LIMIT_EXCEEDED';
  isOperational = true;

  constructor(message: string = 'Too many requests') {
    super(message);
    this.name = 'RateLimitError';
  }
}

/**
 * Get error status code
 */
function getErrorStatusCode(error: unknown): number {
  if (error instanceof Error) {
    if ('statusCode' in error && typeof error.statusCode === 'number') {
      return error.statusCode;
    }
    
    // Common error patterns
    if (error.name === 'ValidationError') return HTTP_STATUS.BAD_REQUEST;
    if (error.name === 'AuthenticationError') return HTTP_STATUS.UNAUTHORIZED;
    if (error.name === 'AuthorizationError') return HTTP_STATUS.FORBIDDEN;
    if (error.name === 'NotFoundError') return HTTP_STATUS.NOT_FOUND;
    if (error.name === 'ConflictError') return HTTP_STATUS.CONFLICT;
    if (error.name === 'RateLimitError') return HTTP_STATUS.TOO_MANY_REQUESTS;
  }
  
  return HTTP_STATUS.INTERNAL_SERVER_ERROR;
}

/**
 * Get error code
 */
function getErrorCode(error: unknown): string {
  if (error instanceof Error) {
    if ('code' in error && typeof error.code === 'string') {
      return error.code;
    }
    return error.name.toUpperCase().replace(/ERROR$/, '_ERROR');
  }
  
  return 'UNKNOWN_ERROR';
}

/**
 * Get error message
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message || 'An unexpected error occurred';
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
}

/**
 * Get error details
 */
function getErrorDetails(error: unknown): Record<string, unknown> | undefined {
  if (error instanceof Error && 'details' in error && error.details !== undefined && error.details !== null) {
    return error.details as Record<string, unknown>;
  }
  
  return undefined;
}

// Extended request type for internal use
interface ExtendedRequest {
  startTime?: number;
  requestId?: string;
}

/**
 * Create error response
 */
function createErrorResponse(
  error: unknown,
  request: ExpressRequest
): {
  status: 'error';
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    stack?: string;
  };
  metadata: {
    timestamp: string;
    requestId: string;
    processingTimeMs: number;
  };
} {
  const extendedReq = request as unknown as ExtendedRequest;
  const startTime = extendedReq.startTime ?? Date.now();
  const processingTime = Date.now() - startTime;
  const requestId = extendedReq.requestId ?? 'unknown';

  const response: {
    status: 'error';
    error: {
      code: string;
      message: string;
      details?: Record<string, unknown>;
      stack?: string;
    };
    metadata: {
      timestamp: string;
      requestId: string;
      processingTimeMs: number;
    };
  } = {
    status: 'error',
    error: {
      code: getErrorCode(error),
      message: getErrorMessage(error),
    },
    metadata: {
      timestamp: new Date().toISOString(),
      requestId,
      processingTimeMs: processingTime,
    },
  };

  // Add error details if available
  const details = getErrorDetails(error);
  if (details !== undefined) {
    response.error.details = details;
  }

  // Add stack trace in development mode
  if (process.env.NODE_ENV === 'development' && error instanceof Error) {
    response.error.stack = error.stack;
  }

  return response;
}

/**
 * Global error handling middleware
 */
export function errorHandler(
  _includeStack = process.env.NODE_ENV === 'development'
): (req: ExpressRequest, res: ExpressResponse, next: () => void) => void {
  return (_req: ExpressRequest, _res: ExpressResponse, next: () => void): void => {
    // Handle errors from downstream middleware/handlers
    next();
  };
}

/**
 * Async error wrapper - catches promise rejections
 */
export function asyncHandler(
  handler: (req: ExpressRequest, res: ExpressResponse) => Promise<unknown>
): (req: ExpressRequest, res: ExpressResponse, next: () => void) => void {
  return (req: ExpressRequest, res: ExpressResponse, next: () => void): void => {
    Promise.resolve(handler(req, res)).catch(next);
  };
}

/**
 * 404 handler middleware
 */
export function notFoundHandler(): (req: ExpressRequest, res: ExpressResponse, _next: () => void) => void {
  return (req: ExpressRequest, res: ExpressResponse, _next: () => void): void => {
    const error = new NotFoundError(`Route ${req.method} ${req.path} not found`);
    const errorResponse = createErrorResponse(error, req);
    res.status(HTTP_STATUS.NOT_FOUND).json(errorResponse);
  };
}

/**
 * Development error handler with full details
 */
export function developmentErrorHandler(
  error: unknown,
  req: ExpressRequest,
  res: ExpressResponse
): void {
  // Sensitive fields to redact from request body
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'authorization'];
  
  console.error('Development Error:', {
    error,
    request: {
      method: req.method,
      url: req.url,
      path: req.path,
      headers: Object.fromEntries(req.headers.entries()),
      body: redactBodyFields(req.body, sensitiveFields),
      query: req.query,
      params: req.params
    }
  });

  const errorResponse = createErrorResponse(error, req);
  const statusCode = getErrorStatusCode(error) as HttpStatusCode;
  
  res.status(statusCode).json(errorResponse);
}

/**
 * Production error handler with minimal details
 */
export function productionErrorHandler(
  error: unknown,
  req: ExpressRequest,
  res: ExpressResponse
): void {
  const extendedReq = req as unknown as ExtendedRequest;
  
  // Log operational errors to console
  console.error('Error:', {
    code: getErrorCode(error),
    message: getErrorMessage(error),
    requestId: extendedReq.requestId,
    path: req.path,
    method: req.method
  });

  const errorResponse = createErrorResponse(error, req);
  const statusCode = getErrorStatusCode(error) as HttpStatusCode;
  
  res.status(statusCode).json(errorResponse);
}

/**
 * Create comprehensive error handler
 */
export function createErrorHandler(options: {
  development?: boolean;
  logErrors?: boolean;
} = {}): (error: unknown, req: ExpressRequest, res: ExpressResponse) => void {
  const {
    development = process.env.NODE_ENV === 'development',
    logErrors = true
  } = options;

  return (error: unknown, req: ExpressRequest, res: ExpressResponse): void => {
    if (logErrors) {
      if (development) {
        developmentErrorHandler(error, req, res);
      } else {
        productionErrorHandler(error, req, res);
      }
    } else {
      // Just return error response without logging
      const errorResponse = createErrorResponse(error, req);
      const statusCode = getErrorStatusCode(error) as HttpStatusCode;
      res.status(statusCode).json(errorResponse);
    }
  };
}

/**
 * Helper function to create standardized error responses
 */
export function createStandardErrorResponse(
  code: string,
  message: string,
  statusCode: HttpStatusCode,
  details?: Record<string, unknown>
): {
  status: 'error';
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  metadata: {
    timestamp: string;
    processingTimeMs: number;
  };
} {
  return {
    status: 'error',
    error: {
      code,
      message,
      ...(details && { details })
    },
    metadata: {
      timestamp: new Date().toISOString(),
      processingTimeMs: 0
    }
  };
}

/**
 * Create validation error response
 */
export function createValidationError(
  message: string,
  errors: Array<{ field: string; message: string; code: string; value?: unknown }>
) {
  return {
    status: 'error' as const,
    error: {
      code: 'VALIDATION_FAILED',
      message,
      details: {
        errors
      }
    },
    metadata: {
      timestamp: new Date().toISOString(),
      processingTimeMs: 0
    }
  };
}
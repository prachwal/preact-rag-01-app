/**
 * Logging Middleware
 * Comprehensive request/response logging for debugging and monitoring
 */

import type { ExpressRequest, ExpressResponse } from '../types/router.types.ts';

// Log entry interface
interface LogEntry {
  timestamp: string;
  requestId: string;
  method: string;
  url: string;
  path: string;
  userAgent?: string | null;
  ip: string;
  userId?: string;
  statusCode: number;
  responseTime: number;
  contentLength: number;
  error?: string;
}

// Request logging options
export interface LoggingOptions {
  includeHeaders?: boolean;
  includeResponse?: boolean;
  includeRequestBody?: boolean;
  redactHeaders?: string[];
  redactBodyFields?: string[];
  logLevel?: 'info' | 'warn' | 'error';
  prettyPrint?: boolean;
}

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  const RADIX = 36;
  const START_INDEX = 2;
  const END_INDEX = 9;
  return `req_${Date.now()}_${Math.random().toString(RADIX).substring(START_INDEX, END_INDEX)}`;
}

/**
 * Extract client IP from request
 */
function getClientIP(request: ExpressRequest): string {
  // Check for forwarded headers first (if behind proxy)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded !== null && forwarded.trim() !== '') {
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP !== null && realIP.trim() !== '') {
    return realIP;
  }

  // Fallback to a default IP for local development
  return '127.0.0.1';
}

/**
 * Redact sensitive information from headers
 */
export function redactHeaders(headers: Headers, redactList: string[]): Record<string, string> {
  const redacted: Record<string, string> = {};
  
  headers.forEach((value, key) => {
    if (redactList.some(redactedKey => 
      key.toLowerCase().includes(redactedKey.toLowerCase()))) {
      redacted[key] = '[REDACTED]';
    } else {
      redacted[key] = value;
    }
  });

  return redacted;
}

/**
 * Redact sensitive fields from request/response body
 */
export function redactBodyFields(body: unknown, redactList: string[]): unknown {
  if (body === null || body === undefined || typeof body !== 'object') {
    return body;
  }

  const redacted = JSON.parse(JSON.stringify(body)) as Record<string, unknown>;
  
  function redactObject(obj: Record<string, unknown>): Record<string, unknown> {
    if (Array.isArray(obj)) {
      return obj.map((item) => {
        if (typeof item === 'object' && item !== null) {
          return redactObject(item as Record<string, unknown>);
        }
        return item;
      }) as unknown as Record<string, unknown>;
    }
    
    if (obj !== null && typeof obj === 'object') {
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
        if (redactList.some(redactedKey => 
          key.toLowerCase().includes(redactedKey.toLowerCase()))) {
          result[key] = '[REDACTED]';
        } else if (typeof value === 'object' && value !== null) {
          result[key] = redactObject(value as Record<string, unknown>);
        } else {
          result[key] = value;
        }
      }
      return result;
    }
    
    return obj;
  }

  return redactObject(redacted);
}

/**
 * Create logging middleware
 */
export function createLogger(options: LoggingOptions = {}): (req: ExpressRequest, res: ExpressResponse, next: () => void) => void {
  // HTTP status code threshold for error logging
  const HTTP_ERROR_THRESHOLD = 400;

  return (req: ExpressRequest, res: ExpressResponse, next: () => void): void => {
    const requestId = generateRequestId();
    const startTime = Date.now();
    const clientIP = getClientIP(req);
    const userAgent = req.headers.get('user-agent') ?? req.headers.get('User-Agent');

    // Generate unique request ID and attach to request
    (req as unknown as { requestId: string }).requestId = requestId;
    
    // Intercept response to capture response time and status
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);
    
    let responseSent = false;

    res.json = function(data: unknown) {
      if (!responseSent) {
        responseSent = true;
        
        // Log the request
        setImmediate(() => logRequest({
          timestamp: new Date().toISOString(),
          requestId,
          method: req.method,
          url: req.url,
          path: req.path,
          userAgent,
          ip: clientIP,
          userId: (req as unknown as { user?: { userId?: string } }).user?.userId,
          statusCode: res.statusCode,
          responseTime: Date.now() - startTime,
          contentLength: JSON.stringify(data).length,
          error: res.statusCode >= HTTP_ERROR_THRESHOLD ? JSON.stringify(data) : undefined
        }, options));
      }
      return originalJson(data);
    };

    res.send = function(data: string) {
      if (!responseSent) {
        responseSent = true;
        
        // Log the request
        setImmediate(() => logRequest({
          timestamp: new Date().toISOString(),
          requestId,
          method: req.method,
          url: req.url,
          path: req.path,
          userAgent,
          ip: clientIP,
          userId: (req as unknown as { user?: { userId?: string } }).user?.userId,
          statusCode: res.statusCode,
          responseTime: Date.now() - startTime,
          contentLength: data.length,
          error: res.statusCode >= HTTP_ERROR_THRESHOLD ? data : undefined
        }, options));
      }
      return originalSend(data);
    };

    next();
  };
}

// JSON pretty print indentation
const JSON_INDENT = 2;

/**
 * Log request entry
 */
function logRequest(entry: LogEntry, options: LoggingOptions): void {
  const { includeHeaders = false, includeResponse = false, includeRequestBody = false, logLevel, prettyPrint } = options;
  
  const logData: Record<string, unknown> = {
    timestamp: entry.timestamp,
    requestId: entry.requestId,
    method: entry.method,
    url: entry.url,
    path: entry.path,
    userAgent: entry.userAgent,
    ip: entry.ip,
    userId: entry.userId,
    statusCode: entry.statusCode,
    responseTime: `${entry.responseTime}ms`,
    contentLength: `${entry.contentLength} bytes`
  };

  // Add headers if requested (redacted)
  if (includeHeaders === true) {
    // Headers would be logged here if needed
  }

  // Add request body if requested (redacted)
  if (includeRequestBody === true) {
    // Request body would be logged here if needed
  }

  // Add response if requested and error
  if (includeResponse === true && entry.error !== undefined) {
    logData.error = entry.error;
  }

  // Output log based on log level
  const indent = prettyPrint === true ? JSON_INDENT : 0;
  if (logLevel === 'error') {
    console.error(JSON.stringify(logData, null, indent));
  } else if (logLevel === 'warn') {
    console.warn(JSON.stringify(logData, null, indent));
  } else {
    console.log(JSON.stringify(logData, null, indent));
  }
}

// Decimal places for duration formatting
const DURATION_DECIMAL_PLACES = 2;

/**
 * Performance logging middleware
 */
export function performanceLogger(): (req: ExpressRequest, res: ExpressResponse, next: () => void) => void {
  // Slow request threshold in milliseconds
  const SLOW_REQUEST_THRESHOLD_MS = 1000;

  return (req: ExpressRequest, res: ExpressResponse, next: () => void): void => {
    const startTime = performance.now();
    
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    res.json = function(data: unknown) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Log slow requests
      if (duration > SLOW_REQUEST_THRESHOLD_MS) {
        console.warn(JSON.stringify({
          type: 'SLOW_REQUEST',
          requestId: (req as unknown as { requestId?: string }).requestId,
          method: req.method,
          path: req.path,
          duration: `${duration.toFixed(DURATION_DECIMAL_PLACES)}ms`,
          timestamp: new Date().toISOString()
        }));
      }
      
      return originalJson(data);
    };

    res.send = function(data: string) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Log slow requests
      if (duration > SLOW_REQUEST_THRESHOLD_MS) {
        console.warn(JSON.stringify({
          type: 'SLOW_REQUEST',
          requestId: (req as unknown as { requestId?: string }).requestId,
          method: req.method,
          path: req.path,
          duration: `${duration.toFixed(DURATION_DECIMAL_PLACES)}ms`,
          timestamp: new Date().toISOString()
        }));
      }
      
      return originalSend(data);
    };

    next();
  };
}
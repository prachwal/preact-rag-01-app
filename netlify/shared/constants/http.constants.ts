/**
 * HTTP Status Codes constants
 */
export const HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
});

// HTTP Status Code type
export type HttpStatusCode = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];

// Constants for request ID generation
export const RANDIX_BASE = 36;
export const SUBSTRING_START = 2;
export const SUBSTRING_LENGTH = 9;

// API Version
export const API_VERSION = '1.0.0';

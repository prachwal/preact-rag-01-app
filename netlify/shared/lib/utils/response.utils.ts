import type {
  ApiError,
  ApiMetadata,
  ApiResponse,
  ApiResponseError,
  ApiResponseSuccess,
} from '../types/api.types.ts';
import {
  API_VERSION,
  HTTP_STATUS,
  RANDIX_BASE,
  SUBSTRING_LENGTH,
  SUBSTRING_START,
  type HttpStatusCode,
} from '../constants/http.constants.ts';

/**
 * Generates a unique request ID
 */
export const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(RANDIX_BASE).substr(SUBSTRING_START, SUBSTRING_LENGTH)}`;
};

/**
 * Creates API metadata
 */
export const createMetadata = (processingTimeMs: number): ApiMetadata => ({
  timestamp: new Date().toISOString(),
  requestId: generateRequestId(),
  version: API_VERSION,
  processingTimeMs,
});

/**
 * Creates an error response
 */
export const createErrorResponse = (error: unknown, processingTimeMs: number): ApiResponseError => {
  const apiError: ApiError =
    error instanceof Error
      ? {
          code: 'INTERNAL_ERROR',
          message: error.message,
        }
      : {
          code: 'UNKNOWN_ERROR',
          message: String(error),
        };

  return {
    status: 'error',
    error: apiError,
    metadata: createMetadata(processingTimeMs),
  };
};

/**
 * Creates a success response
 */
export const createSuccessResponse = <T extends unknown = unknown>(
  payload?: T,
  processingTimeMs?: number
): ApiResponseSuccess<T> => ({
  status: 'success',
  payload,
  metadata: createMetadata(processingTimeMs ?? 0),
});

/**
 * Safely serializes data to JSON, handling circular references
 */
const safeStringify = (data: unknown): string => {
  try {
    return JSON.stringify(data);
  } catch {
    // Handle circular references by replacing them with a placeholder
    const seen = new WeakSet();
    return JSON.stringify(data, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular Reference]';
        }
        seen.add(value);
      }
      return value;
    });
  }
};

/**
 * Creates a JSON response with CORS headers
 */
export const jsonResponse = (
  data: ApiResponse,
  status: HttpStatusCode = HTTP_STATUS.OK
): Response => {
  return new Response(safeStringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-trigger-error',
    },
    status,
  });
};

/**
 * Creates a method not allowed response
 */
export const methodNotAllowed = (startTime: number): Response => {
  const processingTime = Date.now() - startTime;
  const response = createErrorResponse(new Error('Method not allowed'), processingTime);
  return jsonResponse(response, HTTP_STATUS.METHOD_NOT_ALLOWED);
};

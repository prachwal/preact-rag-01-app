/**
 * Industrial-standard API response types
 */

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiMetadata {
  timestamp: string;
  requestId: string;
  version: string;
  processingTimeMs: number;
}

export interface ApiResponseSuccess<T = unknown> {
  status: 'success';
  payload?: T;
  metadata: ApiMetadata;
}

export interface ApiResponseError {
  status: 'error';
  error: ApiError;
  metadata: ApiMetadata;
}

// Union type for generic API responses
export type ApiResponse<T = unknown> = ApiResponseSuccess<T> | ApiResponseError;

// Request context for handlers
export interface RequestContext {
  request: Request;
  url: URL;
  startTime: number;
}

// Handler function type
export type HttpHandler = (ctx: RequestContext) => Response | Promise<Response>;

// Method handlers map (Redux-like pattern)
export interface MethodHandlers {
  GET?: HttpHandler;
  POST?: HttpHandler;
  PUT?: HttpHandler;
  DELETE?: HttpHandler;
  PATCH?: HttpHandler;
  OPTIONS?: HttpHandler;
}

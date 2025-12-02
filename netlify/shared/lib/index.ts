/**
 * Library Export Hub
 * Reusable infrastructure components for API development
 */

// Types
export type {
  ApiError,
  ApiMetadata,
  ApiResponse,
  ApiResponseError,
  ApiResponseSuccess,
  HttpHandler,
  MethodHandlers,
  RequestContext,
} from './types/api.types.ts';

// Router types
export type {
  ExpressRequest,
  ExpressResponse,
  Middleware,
  MiddlewareChain,
  RouteHandler,
} from './types/router.types.ts';
export { createRouter, Router } from './types/router.types.ts';

// Constants
export { API_VERSION, HTTP_STATUS, type HttpStatusCode } from './constants/http.constants.ts';

// Utils
export {
  createErrorResponse,
  createMetadata,
  createSuccessResponse,
  generateRequestId,
  jsonResponse,
  methodNotAllowed,
} from './utils/response.utils.ts';

// Middleware
export * from './middleware/index.ts';

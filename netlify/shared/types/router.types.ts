/**
 * Express-like Router for Netlify Functions
 * Provides familiar Express.js-style routing API
 */

import type { HttpStatusCode } from '../constants/http.constants.ts';
import { HTTP_STATUS } from '../constants/http.constants.ts';

// Route handler type
export type RouteHandler = (
  req: ExpressRequest,
  res: ExpressResponse
) => void | Promise<void>;

// Middleware type
export type Middleware = (
  req: ExpressRequest,
  res: ExpressResponse,
  next: () => void
) => void | Promise<void>;

// Route definition
interface Route {
  method: string;
  path: string | RegExp;
  handler: RouteHandler;
}

// Express-like Request object
export interface ExpressRequest {
  method: string;
  url: string;
  path: string;
  query: Record<string, string>;
  params: Record<string, string>;
  headers: Headers;
  body: unknown;
  originalRequest: Request;
}

// Express-like Response object
export interface ExpressResponse {
  statusCode: HttpStatusCode;
  headers: Record<string, string>;
  
  // Methods
  status: (code: HttpStatusCode) => ExpressResponse;
  json: (data: unknown) => void;
  send: (data: string) => void;
  set: (key: string, value: string) => ExpressResponse;
  setHeader: (key: string, value: string) => ExpressResponse;
  
  // Internal
  _sent: boolean;
  _body: string;
}

/**
 * Express-like Router class
 */
export class Router {
  private routes: Route[] = [];
  private middlewares: Middleware[] = [];
  private basePath = '';

  /**
   * Add middleware
   */
  use(middleware: Middleware): this;
  use(path: string, router: Router): this;
  use(pathOrMiddleware: string | Middleware, router?: Router): this {
    if (typeof pathOrMiddleware === 'function') {
      this.middlewares.push(pathOrMiddleware);
    } else if (router !== undefined) {
      // Mount sub-router
      const subRoutes = router.getRoutes();
      for (const route of subRoutes) {
        this.routes.push({
          ...route,
          path: this.combinePaths(pathOrMiddleware, route.path as string),
        });
      }
    }
    return this;
  }

  /**
   * GET route
   */
  get(path: string, handler: RouteHandler): this {
    this.routes.push({ method: 'GET', path, handler });
    return this;
  }

  /**
   * POST route
   */
  post(path: string, handler: RouteHandler): this {
    this.routes.push({ method: 'POST', path, handler });
    return this;
  }

  /**
   * PUT route
   */
  put(path: string, handler: RouteHandler): this {
    this.routes.push({ method: 'PUT', path, handler });
    return this;
  }

  /**
   * DELETE route
   */
  delete(path: string, handler: RouteHandler): this {
    this.routes.push({ method: 'DELETE', path, handler });
    return this;
  }

  /**
   * PATCH route
   */
  patch(path: string, handler: RouteHandler): this {
    this.routes.push({ method: 'PATCH', path, handler });
    return this;
  }

  /**
   * OPTIONS route
   */
  options(path: string, handler: RouteHandler): this {
    this.routes.push({ method: 'OPTIONS', path, handler });
    return this;
  }

  /**
   * ALL methods route
   */
  all(path: string, handler: RouteHandler): this {
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];
    for (const method of methods) {
      this.routes.push({ method, path, handler });
    }
    return this;
  }

  /**
   * Get all routes (for sub-router mounting)
   */
  getRoutes(): Route[] {
    return this.routes;
  }

  /**
   * Combine paths
   */
  private combinePaths(base: string, path: string): string {
    const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
    // Handle root path case - don't add trailing slash
    if (path === '/' || path === '') {
      return normalizedBase;
    }
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${normalizedBase}${normalizedPath}`;
  }

  /**
   * Match route path with URL path
   */
  private matchPath(
    routePath: string,
    urlPath: string
  ): { match: boolean; params: Record<string, string> } {
    const params: Record<string, string> = {};

    // Exact match
    if (routePath === urlPath) {
      return { match: true, params };
    }

    // Parameter matching (e.g., /users/:id)
    const routeParts = routePath.split('/');
    const urlParts = urlPath.split('/');

    if (routeParts.length !== urlParts.length) {
      return { match: false, params };
    }

    for (let i = 0; i < routeParts.length; i++) {
      const routePart = routeParts[i];
      const urlPart = urlParts[i];

      if (routePart?.startsWith(':')) {
        // Parameter
        const paramName = routePart.slice(1);
        params[paramName] = urlPart ?? '';
      } else if (routePart !== urlPart) {
        return { match: false, params };
      }
    }

    return { match: true, params };
  }

  /**
   * Create Express-like request object
   */
  private async createRequest(request: Request): Promise<ExpressRequest> {
    const url = new URL(request.url);
    const query: Record<string, string> = {};
    
    url.searchParams.forEach((value, key) => {
      query[key] = value;
    });

    let body: unknown = null;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      try {
        body = await request.json();
      } catch {
        body = null;
      }
    }

    return {
      method: request.method.toUpperCase(),
      url: request.url,
      path: url.pathname,
      query,
      params: {},
      headers: request.headers,
      body,
      originalRequest: request,
    };
  }

  /**
   * Create Express-like response object
   */
  private createResponse(): ExpressResponse {
    const res: ExpressResponse = {
      statusCode: HTTP_STATUS.OK,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-trigger-error',
      },
      _sent: false,
      _body: '',

      status(code: HttpStatusCode): ExpressResponse {
        this.statusCode = code;
        return this;
      },

      json(data: unknown): void {
        this._body = JSON.stringify(data);
        this._sent = true;
      },

      send(data: string): void {
        this._body = data;
        this._sent = true;
      },

      set(key: string, value: string): ExpressResponse {
        this.headers[key] = value;
        return this;
      },

      setHeader(key: string, value: string): ExpressResponse {
        this.headers[key] = value;
        return this;
      },
    };

    return res;
  }

  /**
   * Handle incoming request
   */
  async handle(request: Request): Promise<Response> {
    const startTime = Date.now();
    const req = await this.createRequest(request);
    const res = this.createResponse();

    try {
      // Run middlewares
      let middlewareIndex = 0;
      const runMiddleware = async (): Promise<void> => {
        if (middlewareIndex < this.middlewares.length) {
          const middleware = this.middlewares[middlewareIndex];
          middlewareIndex++;
          if (middleware !== undefined) {
            await middleware(req, res, runMiddleware);
          }
        }
      };

      await runMiddleware();

      if (res._sent) {
        return new Response(res._body, {
          status: res.statusCode,
          headers: res.headers,
        });
      }

      // Find matching route
      for (const route of this.routes) {
        if (route.method !== req.method) {
          continue;
        }

        const { match, params } = this.matchPath(route.path as string, req.path);
        if (match) {
          req.params = params;
          await route.handler(req, res);

          if (res._sent) {
            return new Response(res._body, {
              status: res.statusCode,
              headers: res.headers,
            });
          }
        }
      }

      // No route found - 404
      res.status(HTTP_STATUS.NOT_FOUND).json({
        status: 'error',
        error: {
          code: 'NOT_FOUND',
          message: `Cannot ${req.method} ${req.path}`,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          processingTimeMs: Date.now() - startTime,
        },
      });

      return new Response(res._body, {
        status: res.statusCode,
        headers: res.headers,
      });
    } catch (error) {
      // Error handling - return JSON error response
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        error: {
          code: 'INTERNAL_ERROR',
          message: errorMessage,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          processingTimeMs: Date.now() - startTime,
        },
      });

      return new Response(res._body, {
        status: res.statusCode,
        headers: res.headers,
      });
    }
  }
}

/**
 * Create a new router instance (Express-like factory)
 */
export const createRouter = (): Router => new Router();

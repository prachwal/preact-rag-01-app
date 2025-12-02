/**
 * HTTP client for API communication
 */

// HTTP client constants
const HTTP_CONFIG = {
  STATUS_CODES: {
    NOT_FOUND: 404,
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    INTERNAL_SERVER_ERROR: 500,
  },
  DEFAULT_BASE_PATH: '/api',
} as const;

export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  payload: T;
  metadata: {
    timestamp: string;
    version: string;
  };
}

export interface ApiError {
  status: 'error';
  payload?: unknown;
  metadata?: {
    timestamp: string;
    version: string;
    error?: string;
  };
}

class HttpClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    // Auto-detect base URL based on environment
    if (baseUrl != null && baseUrl.trim() !== '') {
      this.baseUrl = baseUrl;
    } else {
      // Use relative URL in production, absolute for development
      if (import.meta.env.DEV) {
        // In development, try to use the same origin as the Vite dev server
        this.baseUrl = HTTP_CONFIG.DEFAULT_BASE_PATH;
      } else {
        // In production, use relative path
        this.baseUrl = HTTP_CONFIG.DEFAULT_BASE_PATH;
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    params?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    // Normalize URL - remove leading slash from endpoint to avoid double slash
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    let url = `${this.baseUrl}${cleanEndpoint ? `/${cleanEndpoint}` : ''}`;
    
    // Add query params if provided
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        // In development, provide helpful error message
        if (import.meta.env.DEV && response.status === HTTP_CONFIG.STATUS_CODES.NOT_FOUND) {
          throw new Error(
            `API endpoint not found. Make sure Netlify Functions are running.\n` +
            `URL: ${url}\n` +
            `Check that Netlify Dev is running and functions are deployed.`
          );
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${errorData.message ?? response.statusText}`);
      }

      const data = await response.json();
      return data as ApiResponse<T>;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unknown error occurred');
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' }, params);
  }

  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
  }
}

export { HttpClient };
export const httpClient = new HttpClient();

export default HttpClient;
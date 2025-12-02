/**
 * API Types Tests
 * Type validation tests for API type definitions
 */

import { describe, it, expect } from 'vitest';
import type {
  ApiError,
  ApiMetadata,
  ApiResponse,
  ApiResponseError,
  ApiResponseSuccess,
  HttpHandler,
  MethodHandlers,
  RequestContext,
} from './api.types';

describe('API Types', () => {
  describe('ApiError', () => {
    it('should have correct structure', () => {
      const error: ApiError = {
        code: 'TEST_ERROR',
        message: 'This is a test error',
      };

      expect(error.code).toBe('TEST_ERROR');
      expect(error.message).toBe('This is a test error');
      expect(typeof error.code).toBe('string');
      expect(typeof error.message).toBe('string');
    });

    it('should allow optional details property', () => {
      const errorWithDetails: ApiError = {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: {
          field: 'email',
          value: 'invalid-email',
        },
      };

      expect(errorWithDetails.code).toBe('VALIDATION_ERROR');
      expect(errorWithDetails.details?.field).toBe('email');
    });
  });

  describe('ApiMetadata', () => {
    it('should have correct structure', () => {
      const metadata: ApiMetadata = {
        timestamp: '2023-12-01T10:00:00.000Z',
        requestId: 'req_12345',
        version: '1.0.0',
        processingTimeMs: 150,
      };

      expect(metadata.timestamp).toBe('2023-12-01T10:00:00.000Z');
      expect(metadata.requestId).toBe('req_12345');
      expect(metadata.version).toBe('1.0.0');
      expect(metadata.processingTimeMs).toBe(150);
    });

    it('should have correct types', () => {
      const metadata: ApiMetadata = {
        timestamp: new Date().toISOString(),
        requestId: 'req_test',
        version: '2.0.0',
        processingTimeMs: 0,
      };

      expect(typeof metadata.timestamp).toBe('string');
      expect(typeof metadata.requestId).toBe('string');
      expect(typeof metadata.version).toBe('string');
      expect(typeof metadata.processingTimeMs).toBe('number');
    });
  });

  describe('ApiResponse', () => {
    it('should be a union type', () => {
      const successResponse: ApiResponseSuccess = {
        status: 'success',
        payload: { message: 'Success' },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: 'req_1',
          version: '1.0.0',
          processingTimeMs: 100,
        },
      };

      const errorResponse: ApiResponseError = {
        status: 'error',
        error: {
          code: 'ERROR',
          message: 'Something went wrong',
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: 'req_2',
          version: '1.0.0',
          processingTimeMs: 50,
        },
      };

      expect(successResponse.status).toBe('success');
      expect(errorResponse.status).toBe('error');
      expect((successResponse as any).payload).toBeDefined();
      expect((errorResponse as any).error).toBeDefined();
    });
  });

  describe('ApiResponseSuccess', () => {
    it('should have correct structure for success responses', () => {
      const response: ApiResponseSuccess = {
        status: 'success',
        payload: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
        },
        metadata: {
          timestamp: '2023-12-01T10:00:00.000Z',
          requestId: 'req_success',
          version: '1.0.0',
          processingTimeMs: 200,
        },
      };

      expect(response.status).toBe('success');
      expect(response.payload).toBeDefined();
      expect(response.metadata).toBeDefined();
      expect((response.payload as any)?.id).toBe(1);
    });

    it('should allow undefined payload', () => {
      const response: ApiResponseSuccess = {
        status: 'success',
        payload: undefined,
        metadata: {
          timestamp: '2023-12-01T10:00:00.000Z',
          requestId: 'req_success',
          version: '1.0.0',
          processingTimeMs: 100,
        },
      };

      expect(response.status).toBe('success');
      expect(response.payload).toBeUndefined();
    });
  });

  describe('ApiResponseError', () => {
    it('should have correct structure for error responses', () => {
      const response: ApiResponseError = {
        status: 'error',
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: {
            field: 'email',
            issue: 'Invalid format',
          },
        },
        metadata: {
          timestamp: '2023-12-01T10:00:00.000Z',
          requestId: 'req_error',
          version: '1.0.0',
          processingTimeMs: 150,
        },
      };

      expect(response.status).toBe('error');
      expect(response.error).toBeDefined();
      expect(response.error.code).toBe('VALIDATION_ERROR');
      expect(response.error.message).toBe('Invalid input data');
    });
  });

  describe('HttpHandler', () => {
    it('should be a function type that returns Response or Promise<Response>', () => {
      // HttpHandler is a type alias and won't exist at runtime
      // This test validates that the type compiles correctly
      const handler: HttpHandler = async (_ctx) => {
        return new Response('OK');
      };
      
      expect(typeof handler).toBe('function');
      expect(handler).toBeInstanceOf(Function);
    });
  });

  describe('MethodHandlers', () => {
    it('should have optional handlers for each HTTP method', () => {
      const handlers: Partial<MethodHandlers> = {
        GET: async () => new Response('GET response'),
        POST: async () => new Response('POST response'),
        // PUT, PATCH, DELETE are optional
      };

      expect(handlers.GET).toBeDefined();
      expect(handlers.POST).toBeDefined();
      expect(handlers.PUT).toBeUndefined();
      expect(handlers.PATCH).toBeUndefined();
      expect(handlers.DELETE).toBeUndefined();
    });

    it('should allow all HTTP methods', () => {
      const allMethods: MethodHandlers = {
        GET: async () => new Response('GET'),
        POST: async () => new Response('POST'),
        PUT: async () => new Response('PUT'),
        PATCH: async () => new Response('PATCH'),
        DELETE: async () => new Response('DELETE'),
        OPTIONS: async () => new Response('OPTIONS'),
      };

      expect(allMethods.GET).toBeDefined();
      expect(allMethods.POST).toBeDefined();
      expect(allMethods.PUT).toBeDefined();
      expect(allMethods.PATCH).toBeDefined();
      expect(allMethods.DELETE).toBeDefined();
      expect(allMethods.OPTIONS).toBeDefined();
    });
  });

  describe('RequestContext', () => {
    it('should have correct structure', () => {
      const context: RequestContext = {
        request: new Request('http://example.com'),
        url: new URL('http://example.com'),
        startTime: Date.now(),
      };

      expect(context.request).toBeInstanceOf(Request);
      expect(context.url).toBeInstanceOf(URL);
      expect(typeof context.startTime).toBe('number');
    });

    it('should have correct types for all properties', () => {
      const context: RequestContext = {
        request: new Request('http://test.com'),
        url: new URL('http://test.com'),
        startTime: 1234567890,
      };

      expect(typeof context.request).toBe('object');
      expect(typeof context.url).toBe('object');
      expect(typeof context.startTime).toBe('number');
    });
  });

  describe('Type Relationships', () => {
    it('should ensure ApiResponse is union of success and error', () => {
      const successResponse: ApiResponse = {
        status: 'success',
        payload: { data: 'test' },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: 'req_union',
          version: '1.0.0',
          processingTimeMs: 0,
        },
      };

      const errorResponse: ApiResponse = {
        status: 'error',
        error: {
          code: 'TEST_ERROR',
          message: 'Test error',
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: 'req_union',
          version: '1.0.0',
          processingTimeMs: 0,
        },
      };

      expect(successResponse.status).toBe('success');
      expect(errorResponse.status).toBe('error');
      expect('payload' in successResponse).toBe(true);
      expect('error' in errorResponse).toBe(true);
    });

    it('should enforce status field in all responses', () => {
      const successResponse: ApiResponseSuccess = {
        status: 'success',
        payload: null,
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: 'req_status',
          version: '1.0.0',
          processingTimeMs: 0,
        },
      };

      const errorResponse: ApiResponseError = {
        status: 'error',
        error: {
          code: 'STATUS_ERROR',
          message: 'Status test',
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: 'req_status',
          version: '1.0.0',
          processingTimeMs: 0,
        },
      };

      expect(successResponse.status).toBe('success');
      expect(errorResponse.status).toBe('error');
      expect(successResponse.status).not.toBe('error');
      expect(errorResponse.status).not.toBe('success');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty objects and arrays', () => {
      const emptyObjectResponse: ApiResponseSuccess = {
        status: 'success',
        payload: {},
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: 'req_empty',
          version: '1.0.0',
          processingTimeMs: 0,
        },
      };

      const emptyArrayResponse: ApiResponseSuccess = {
        status: 'success',
        payload: [],
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: 'req_empty_array',
          version: '1.0.0',
          processingTimeMs: 0,
        },
      };

      expect(emptyObjectResponse.payload).toEqual({});
      expect(emptyArrayResponse.payload).toEqual([]);
    });

    it('should handle complex nested structures', () => {
      const complexPayload = {
        user: {
          id: 1,
          profile: {
            name: 'John',
            settings: {
              theme: 'dark',
              notifications: {
                email: true,
                push: false,
              },
            },
          },
        },
        metadata: {
          createdAt: '2023-01-01T00:00:00.000Z',
          tags: ['admin', 'verified'],
        },
      };

      const response: ApiResponseSuccess = {
        status: 'success',
        payload: complexPayload,
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: 'req_complex',
          version: '1.0.0',
          processingTimeMs: 0,
        },
      };

      expect((response.payload as any)?.user?.profile?.settings?.theme).toBe('dark');
      expect((response.payload as any)?.metadata?.tags).toContain('admin');
    });

    it('should handle special characters in strings', () => {
      const specialString = 'Test with "quotes", \'apostrophes\', and special chars: @#$%^&*()';
      
      const response: ApiResponseSuccess = {
        status: 'success',
        payload: { message: specialString },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: 'req_special',
          version: '1.0.0',
          processingTimeMs: 0,
        },
      };

      expect((response.payload as any)?.message).toBe(specialString);
    });

    it('should handle very large numbers in processingTimeMs', () => {
      const response: ApiResponseSuccess = {
        status: 'success',
        payload: null,
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: 'req_large_time',
          version: '1.0.0',
          processingTimeMs: Number.MAX_SAFE_INTEGER,
        },
      };

      expect(response.metadata.processingTimeMs).toBe(Number.MAX_SAFE_INTEGER);
    });

    it('should handle very long strings in metadata', () => {
      const longRequestId = 'req_' + 'x'.repeat(1000);
      
      const response: ApiResponseSuccess = {
        status: 'success',
        payload: null,
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: longRequestId,
          version: '1.0.0',
          processingTimeMs: 0,
        },
      };

      expect(response.metadata.requestId).toBe(longRequestId);
      expect(response.metadata.requestId.length).toBe(1004);
    });
  });

  describe('Generic Type Parameters', () => {
    it('should work with different generic types', () => {
      const stringResponse: ApiResponseSuccess<string> = {
        status: 'success',
        payload: 'Hello World',
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: 'req_generic_string',
          version: '1.0.0',
          processingTimeMs: 0,
        },
      };

      const numberResponse: ApiResponseSuccess<number> = {
        status: 'success',
        payload: 42,
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: 'req_generic_number',
          version: '1.0.0',
          processingTimeMs: 0,
        },
      };

      const objectResponse: ApiResponseSuccess<{ id: number; name: string }> = {
        status: 'success',
        payload: { id: 1, name: 'Test' },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: 'req_generic_object',
          version: '1.0.0',
          processingTimeMs: 0,
        },
      };

      expect(stringResponse.payload).toBe('Hello World');
      expect(numberResponse.payload).toBe(42);
      expect(objectResponse.payload).toEqual({ id: 1, name: 'Test' });
    });

    it('should work with array types', () => {
      const arrayResponse: ApiResponseSuccess<number[]> = {
        status: 'success',
        payload: [1, 2, 3, 4, 5],
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: 'req_generic_array',
          version: '1.0.0',
          processingTimeMs: 0,
        },
      };

      expect(arrayResponse.payload).toHaveLength(5);
      expect(arrayResponse.payload).toContain(3);
    });
  });
});
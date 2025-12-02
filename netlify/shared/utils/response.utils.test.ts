/**
 * Response Utils Module Tests
 * Comprehensive test coverage for response utility functions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateRequestId,
  createMetadata,
  createErrorResponse,
  createSuccessResponse,
  jsonResponse,
  methodNotAllowed,
} from './response.utils';
import { HTTP_STATUS, API_VERSION } from '../constants/http.constants';

describe('Response Utils Module', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('generateRequestId', () => {
    it('should generate a request ID with correct format', () => {
      const requestId = generateRequestId();
      expect(requestId).toMatch(/^req_\d+_[a-z0-9]{9}$/);
      expect(requestId).toMatch(/^req_/);
    });

    it('should generate unique request IDs', () => {
      const id1 = generateRequestId();
      const id2 = generateRequestId();
      expect(id1).not.toBe(id2);
    });

    it('should generate IDs with correct timestamp format', () => {
      const timestamp = Date.now();
      vi.setSystemTime(timestamp);
      
      const requestId = generateRequestId();
      expect(requestId).toContain(timestamp.toString());
    });
  });

  describe('createMetadata', () => {
    it('should create metadata with correct structure', () => {
      const processingTimeMs = 150;
      const metadata = createMetadata(processingTimeMs);

      expect(metadata).toHaveProperty('timestamp');
      expect(metadata).toHaveProperty('requestId');
      expect(metadata).toHaveProperty('version');
      expect(metadata).toHaveProperty('processingTimeMs');
      expect(metadata.processingTimeMs).toBe(processingTimeMs);
      expect(metadata.version).toBe(API_VERSION);
    });

    it('should generate a request ID in metadata', () => {
      const metadata = createMetadata(100);
      expect(metadata.requestId).toMatch(/^req_\d+_[a-z0-9]{9}$/);
    });

    it('should use current timestamp', () => {
      const timestamp = new Date().toISOString();
      const metadata = createMetadata(50);
      expect(metadata.timestamp).toBe(timestamp);
    });

    it('should handle zero processing time', () => {
      const metadata = createMetadata(0);
      expect(metadata.processingTimeMs).toBe(0);
    });
  });

  describe('createErrorResponse', () => {
    it('should create error response for Error instance', () => {
      const error = new Error('Test error message');
      const processingTime = 200;
      const response = createErrorResponse(error, processingTime);

      expect(response.status).toBe('error');
      expect(response.error.code).toBe('INTERNAL_ERROR');
      expect(response.error.message).toBe('Test error message');
      expect(response.metadata.processingTimeMs).toBe(processingTime);
    });

    it('should create error response for non-Error objects', () => {
      const error = 'String error';
      const processingTime = 150;
      const response = createErrorResponse(error, processingTime);

      expect(response.status).toBe('error');
      expect(response.error.code).toBe('UNKNOWN_ERROR');
      expect(response.error.message).toBe('String error');
    });

    it('should create error response for null error', () => {
      const error = null;
      const processingTime = 100;
      const response = createErrorResponse(error, processingTime);

      expect(response.status).toBe('error');
      expect(response.error.code).toBe('UNKNOWN_ERROR');
      expect(response.error.message).toBe('null');
    });

    it('should create error response for undefined error', () => {
      const error = undefined;
      const processingTime = 100;
      const response = createErrorResponse(error, processingTime);

      expect(response.status).toBe('error');
      expect(response.error.code).toBe('UNKNOWN_ERROR');
      expect(response.error.message).toBe('undefined');
    });

    it('should create error response for object error', () => {
      const error = { message: 'Custom error', code: 'CUSTOM' };
      const processingTime = 75;
      const response = createErrorResponse(error, processingTime);

      expect(response.status).toBe('error');
      expect(response.error.code).toBe('UNKNOWN_ERROR');
      expect(response.error.message).toBe('[object Object]');
    });

    it('should include metadata in error response', () => {
      const error = new Error('Test error');
      const response = createErrorResponse(error, 300);

      expect(response.metadata).toBeDefined();
      expect(response.metadata.requestId).toMatch(/^req_\d+_[a-z0-9]{9}$/);
      expect(response.metadata.version).toBe(API_VERSION);
      expect(response.metadata.timestamp).toBeDefined();
    });
  });

  describe('createSuccessResponse', () => {
    it('should create success response with payload', () => {
      const payload = { message: 'Success', data: [1, 2, 3] };
      const processingTime = 100;
      const response = createSuccessResponse(payload, processingTime);

      expect(response.status).toBe('success');
      expect(response.payload).toBe(payload);
      expect(response.metadata.processingTimeMs).toBe(processingTime);
    });

    it('should create success response without payload', () => {
      const processingTime = 50;
      const response = createSuccessResponse(undefined, processingTime);

      expect(response.status).toBe('success');
      expect(response.payload).toBeUndefined();
      expect(response.metadata.processingTimeMs).toBe(processingTime);
    });

    it('should create success response with default processing time', () => {
      const response = createSuccessResponse({ test: 'data' });

      expect(response.status).toBe('success');
      expect(response.payload).toEqual({ test: 'data' });
      expect(response.metadata.processingTimeMs).toBe(0);
    });

    it('should handle complex payload types', () => {
      const payloads = [
        { complex: { nested: { object: true } }, array: [1, 2, 3], null: null },
        'string payload',
        123,
        true,
        [],
      ];

      payloads.forEach((payload) => {
        const response = createSuccessResponse(payload);
        expect(response.payload).toEqual(payload);
        expect(response.status).toBe('success');
      });
    });

    it('should include metadata in success response', () => {
      const response = createSuccessResponse({ data: 'test' }, 250);

      expect(response.metadata).toBeDefined();
      expect(response.metadata.requestId).toMatch(/^req_\d+_[a-z0-9]{9}$/);
      expect(response.metadata.version).toBe(API_VERSION);
      expect(response.metadata.timestamp).toBeDefined();
    });

    it('should create typed response for different generics', () => {
      const stringResponse = createSuccessResponse<string>('hello');
      const numberResponse = createSuccessResponse<number>(42);
      const objectResponse = createSuccessResponse<{ id: number }>({ id: 1 });

      expect(stringResponse.payload).toBe('hello');
      expect(numberResponse.payload).toBe(42);
      expect(objectResponse.payload).toEqual({ id: 1 });
    });
  });

  describe('jsonResponse', () => {
    it('should create response with correct status', () => {
      const data = createSuccessResponse({ message: 'Test' });
      const response = jsonResponse(data, HTTP_STATUS.OK);

      expect(response.status).toBe(200);
    });

    it('should create response with different status codes', () => {
      const data = createErrorResponse('Not found', 0);
      const response = jsonResponse(data, HTTP_STATUS.NOT_FOUND);

      expect(response.status).toBe(404);
    });

    it('should include JSON content type header', () => {
      const data = createSuccessResponse({ test: true });
      const response = jsonResponse(data);

      expect(response.headers.get('Content-Type')).toBe('application/json');
    });

    it('should include CORS headers', () => {
      const data = createSuccessResponse({ test: true });
      const response = jsonResponse(data);

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe(
        'GET, POST, PUT, DELETE, PATCH, OPTIONS'
      );
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe(
        'Content-Type, Authorization, x-trigger-error'
      );
    });

    it('should serialize data to JSON', () => {
      const data = createSuccessResponse({ message: 'Hello World', count: 42, nested: { value: true } });
      const response = jsonResponse(data);

      return response.text().then((text) => {
        const parsed = JSON.parse(text);
        expect(parsed).toEqual(data);
      });
    });

    it('should handle circular references gracefully', () => {
      const circularData: any = { name: 'test' };
      circularData.self = circularData;

      expect(() => {
        jsonResponse(circularData);
      }).not.toThrow();
    });

    it('should handle different HTTP status codes', () => {
      const statuses = [
        HTTP_STATUS.OK,
        HTTP_STATUS.CREATED,
        HTTP_STATUS.BAD_REQUEST,
        HTTP_STATUS.NOT_FOUND,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ];

      const data = createSuccessResponse({ test: 'response' });

      statuses.forEach((status) => {
        const response = jsonResponse(data, status);
        expect(response.status).toBe(status);
      });
    });
  });

  describe('methodNotAllowed', () => {
    it('should create method not allowed response', () => {
      const startTime = Date.now() - 100; // 100ms ago
      const response = methodNotAllowed(startTime);

      expect(response.status).toBe(HTTP_STATUS.METHOD_NOT_ALLOWED);
      expect(response.status).toBe(405);
    });

    it('should create error response with correct message', () => {
      const startTime = Date.now() - 50;
      const response = methodNotAllowed(startTime);

      return response.json().then((data) => {
        expect(data.status).toBe('error');
        expect(data.error.code).toBe('INTERNAL_ERROR');
        expect(data.error.message).toBe('Method not allowed');
      });
    });

    it('should calculate correct processing time', () => {
      const startTime = Date.now() - 200;
      const response = methodNotAllowed(startTime);

      return response.json().then((data) => {
        // Should be approximately 200ms (allowing for small timing differences)
        expect(data.metadata.processingTimeMs).toBeGreaterThanOrEqual(190);
        expect(data.metadata.processingTimeMs).toBeLessThanOrEqual(210);
      });
    });

    it('should include CORS headers', () => {
      const startTime = Date.now() - 30;
      const response = methodNotAllowed(startTime);

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });

    it('should handle negative processing time', () => {
      const futureTime = Date.now() + 1000;
      const response = methodNotAllowed(futureTime);

      return response.json().then((data) => {
        expect(data.metadata.processingTimeMs).toBeLessThan(0);
      });
    });
  });

  describe('Integration Tests', () => {
    it('should work with all utilities together', () => {
      const startTime = Date.now();

      // Create success response
      const successResponse = createSuccessResponse(
        { message: 'Success', timestamp: new Date().toISOString() },
        Date.now() - startTime
      );

      // Create error response
      const errorResponse = createErrorResponse(
        new Error('Test error'),
        Date.now() - startTime
      );

      // Convert to JSON responses
      const successJsonResponse = jsonResponse(successResponse);
      const errorJsonResponse = jsonResponse(errorResponse, HTTP_STATUS.BAD_REQUEST);

      expect(successJsonResponse.status).toBe(200);
      expect(errorJsonResponse.status).toBe(400);

      expect(successJsonResponse.headers.get('Content-Type')).toBe('application/json');
      expect(errorJsonResponse.headers.get('Content-Type')).toBe('application/json');
    });

    it('should maintain consistent metadata structure', () => {
      const processingTime = 150;

      const successMetadata = createMetadata(processingTime);
      const errorMetadata = createMetadata(processingTime);

      expect(successMetadata).toHaveProperty('timestamp');
      expect(successMetadata).toHaveProperty('requestId');
      expect(successMetadata).toHaveProperty('version');
      expect(successMetadata).toHaveProperty('processingTimeMs');

      expect(errorMetadata.timestamp).toBe(successMetadata.timestamp);
      expect(errorMetadata.version).toBe(successMetadata.version);
      expect(errorMetadata.processingTimeMs).toBe(successMetadata.processingTimeMs);
    });

    it('should handle concurrent requests correctly', () => {
      const responses = Array.from({ length: 5 }, (_, i) => {
        const processingTime = (i + 1) * 10;
        return createSuccessResponse({ request: i }, processingTime);
      });

      responses.forEach((response, index) => {
        expect(response.metadata.processingTimeMs).toBe((index + 1) * 10);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(response.payload!.request).toBe(index);
      });

      // Verify all request IDs are unique
      const requestIds = responses.map(r => r.metadata.requestId);
      const uniqueIds = [...new Set(requestIds)];
      expect(requestIds).toHaveLength(uniqueIds.length);
      
      // Verify payload structure
      responses.forEach((response, index) => {
        expect(response.payload).toBeDefined();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(response.payload!.request).toBe(index);
      });
    });
  });
});
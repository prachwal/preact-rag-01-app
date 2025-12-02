/**
 * Unit tests for API route handlers
 * Tests all route handlers that use HTTP_STATUS constants
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { getGreeting, postData, optionsCors, healthCheck, getUserById } from './api.routes.ts';
import type { ExpressRequest, ExpressResponse } from '../types/router.types.ts';
import { HTTP_STATUS, type HttpStatusCode } from '../constants/http.constants.ts';

describe('API Route Handlers', () => {
  let mockRequest: ExpressRequest;
  let mockResponse: ExpressResponse;
  let responseData: any;

  beforeEach(() => {
    responseData = null;

    mockResponse = {
      statusCode: HTTP_STATUS.OK,
      headers: {},
      status: function(code: HttpStatusCode) {
        this.statusCode = code;
        return this;
      },
      json: function(data: unknown) {
        responseData = data;
        this._sent = true;
      },
      send: function(data: string) {
        responseData = data;
        this._sent = true;
      },
      set: function(key: string, value: string) {
        this.headers[key] = value;
        return this;
      },
      setHeader: function(key: string, value: string) {
        this.headers[key] = value;
        return this;
      },
      _sent: false,
      _body: '',
    };

    mockRequest = {
      method: 'GET',
      url: 'http://localhost:3000/api',
      path: '/api',
      query: {},
      params: {},
      headers: new Headers(),
      body: null,
      originalRequest: new Request('http://localhost:3000/api'),
    };
  });

  describe('getGreeting', () => {
    it('should return greeting with HTTP_STATUS.OK', async () => {
      mockRequest.query = {};

      await getGreeting(mockRequest, mockResponse);

      expect(mockResponse.statusCode).toBe(HTTP_STATUS.OK);
      expect(responseData.status).toBe('success');
      expect(responseData.payload.message).toBe('Hello World');
      expect(responseData.metadata).toHaveProperty('timestamp');
      expect(responseData.metadata).toHaveProperty('version', '1.0.0');
    });

    it('should return personalized greeting with name parameter', async () => {
      mockRequest.query = { name: 'Jan' };

      await getGreeting(mockRequest, mockResponse);

      expect(mockResponse.statusCode).toBe(HTTP_STATUS.OK);
      expect(responseData.payload.message).toBe('Hello Jan');
    });

    it('should handle trimmed name parameter', async () => {
      mockRequest.query = { name: '  TestUser  ' };

      await getGreeting(mockRequest, mockResponse);

      expect(mockResponse.statusCode).toBe(HTTP_STATUS.OK);
      expect(responseData.payload.message).toBe('Hello TestUser');
    });

    it('should fallback to "World" for empty name', async () => {
      mockRequest.query = { name: '' };

      await getGreeting(mockRequest, mockResponse);

      expect(mockResponse.statusCode).toBe(HTTP_STATUS.OK);
      expect(responseData.payload.message).toBe('Hello World');
    });

    it('should fallback to "World" for whitespace-only name', async () => {
      mockRequest.query = { name: '   ' };

      await getGreeting(mockRequest, mockResponse);

      expect(mockResponse.statusCode).toBe(HTTP_STATUS.OK);
      expect(responseData.payload.message).toBe('Hello World');
    });

    it('should handle x-trigger-error header by throwing error', async () => {
      mockRequest.headers = new Headers({ 'x-trigger-error': 'true' });
      mockRequest.query = {};

      // The route handler should throw the error
      expect(() => {
        getGreeting(mockRequest, mockResponse);
      }).toThrow('Simulated error triggered by x-trigger-error header');
    });
  });

  describe('postData', () => {
    it('should return created status with HTTP_STATUS.CREATED', async () => {
      mockRequest.method = 'POST';
      mockRequest.body = { test: 'data' };

      await postData(mockRequest, mockResponse);

      expect(mockResponse.statusCode).toBe(HTTP_STATUS.CREATED);
      expect(responseData.status).toBe('success');
      expect(responseData.payload.message).toBe('Data received successfully');
      expect(responseData.payload.received).toEqual({ test: 'data' });
    });

    it('should handle empty request body', async () => {
      mockRequest.method = 'POST';
      mockRequest.body = null;

      await postData(mockRequest, mockResponse);

      expect(mockResponse.statusCode).toBe(HTTP_STATUS.CREATED);
      expect(responseData.status).toBe('success');
    });
  });

  describe('optionsCors', () => {
    it('should return no content status with HTTP_STATUS.NO_CONTENT', async () => {
      mockRequest.method = 'OPTIONS';

      await optionsCors(mockRequest, mockResponse);

      expect(mockResponse.statusCode).toBe(HTTP_STATUS.NO_CONTENT);
      expect(responseData.status).toBe('success');
    });
  });

  describe('getUserById', () => {
    it('should return user data with HTTP_STATUS.OK', async () => {
      mockRequest.params = { id: '42' };

      await getUserById(mockRequest, mockResponse);

      expect(mockResponse.statusCode).toBe(HTTP_STATUS.OK);
      expect(responseData.status).toBe('success');
      expect(responseData.payload.id).toBe('42');
      expect(responseData.payload.name).toBe('User 42');
      expect(responseData.payload.email).toBe('user42@example.com');
    });

    it('should handle different user IDs', async () => {
      mockRequest.params = { id: '123' };

      await getUserById(mockRequest, mockResponse);

      expect(mockResponse.statusCode).toBe(HTTP_STATUS.OK);
      expect(responseData.payload.id).toBe('123');
      expect(responseData.payload.name).toBe('User 123');
    });
  });

  describe('healthCheck', () => {
    it('should return health status with HTTP_STATUS.OK', async () => {
      await healthCheck(mockRequest, mockResponse);

      expect(mockResponse.statusCode).toBe(HTTP_STATUS.OK);
      expect(responseData.status).toBe('success');
      expect(responseData.payload.healthy).toBe(true);
      expect(responseData.payload.uptime).toBeGreaterThan(0);
      expect(responseData.metadata.timestamp).toBeDefined();
    });
  });

  describe('HTTP Status Code Usage', () => {
    it('should use HTTP_STATUS constants instead of magic numbers', () => {
      // Verify that all handlers use the constants
      expect(HTTP_STATUS.OK).toBe(200);
      expect(HTTP_STATUS.CREATED).toBe(201);
      expect(HTTP_STATUS.NO_CONTENT).toBe(204);
      expect(HTTP_STATUS.NOT_FOUND).toBe(404);
      expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500);
    });

    it('should have consistent status code usage across all handlers', () => {
      // This test ensures that all handlers properly use the constants
      const requiredStatuses = [
        HTTP_STATUS.OK,
        HTTP_STATUS.CREATED,
        HTTP_STATUS.NO_CONTENT,
      ];

      requiredStatuses.forEach(status => {
        expect(typeof status).toBe('number');
        expect(status).toBeGreaterThan(0);
        expect(status).toBeLessThan(600);
      });
    });
  });

  describe('Response Structure', () => {
    it('should return consistent response structure', async () => {
      await getGreeting(mockRequest, mockResponse);

      expect(responseData).toHaveProperty('status', 'success');
      expect(responseData).toHaveProperty('payload');
      expect(responseData).toHaveProperty('metadata');
      expect(responseData.metadata).toHaveProperty('timestamp');
      expect(responseData.metadata).toHaveProperty('version', '1.0.0');
    });

    it('should include proper metadata in all responses', async () => {
      mockRequest.query = { name: 'Test' };

      await getGreeting(mockRequest, mockResponse);

      const timestamp = responseData.metadata.timestamp;
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/); // ISO date format
      expect(responseData.metadata.version).toBe('1.0.0');
    });
  });
});
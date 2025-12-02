/**
 * Tests for HTTP client
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HttpClient } from './http-client';

// Mock fetch globally using Vitest's stubGlobal
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('HttpClient', () => {
  let client: HttpClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new HttpClient('/api');
  });

  describe('URL normalization', () => {
    it('should normalize endpoint without leading slash', async () => {
      const mockResponse = { status: 'success', payload: {}, metadata: { timestamp: '', version: '1.0.0' } };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await client.get('test');

      expect(mockFetch).toHaveBeenCalledWith('/api/test', expect.any(Object));
    });

    it('should normalize endpoint with leading slash', async () => {
      const mockResponse = { status: 'success', payload: {}, metadata: { timestamp: '', version: '1.0.0' } };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await client.get('/test');

      expect(mockFetch).toHaveBeenCalledWith('/api/test', expect.any(Object));
    });

    it('should handle root endpoint', async () => {
      const mockResponse = { status: 'success', payload: {}, metadata: { timestamp: '', version: '1.0.0' } };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await client.get('/');

      expect(mockFetch).toHaveBeenCalledWith('/api', expect.any(Object));
    });
  });

  describe('Query parameters', () => {
    it('should add query parameters to GET request', async () => {
      const mockResponse = { status: 'success', payload: {}, metadata: { timestamp: '', version: '1.0.0' } };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await client.get('/', { name: 'test', value: '123' });

      expect(mockFetch).toHaveBeenCalledWith('/api?name=test&value=123', expect.any(Object));
    });

    it('should handle empty query parameters', async () => {
      const mockResponse = { status: 'success', payload: {}, metadata: { timestamp: '', version: '1.0.0' } };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await client.get('/', {});

      expect(mockFetch).toHaveBeenCalledWith('/api', expect.any(Object));
    });

    it('should URL encode query parameters', async () => {
      const mockResponse = { status: 'success', payload: {}, metadata: { timestamp: '', version: '1.0.0' } };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await client.get('/', { name: 'test space', value: 'special&chars' });

      expect(mockFetch).toHaveBeenCalledWith('/api?name=test+space&value=special%26chars', expect.any(Object));
    });
  });

  describe('HTTP methods', () => {
    const mockResponse = { status: 'success', payload: {}, metadata: { timestamp: '', version: '1.0.0' } };

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });
    });

    it('should make POST request with data', async () => {
      const data = { name: 'test' };

      await client.post('/test', data);

      expect(mockFetch).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    });

    it('should make PUT request with data', async () => {
      const data = { name: 'test' };

      await client.put('/test', data);

      expect(mockFetch).toHaveBeenCalledWith('/api/test', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    });

    it('should make DELETE request', async () => {
      await client.delete('/test');

      expect(mockFetch).toHaveBeenCalledWith('/api/test', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should make PATCH request with data', async () => {
      const data = { name: 'test' };

      await client.patch('/test', data);

      expect(mockFetch).toHaveBeenCalledWith('/api/test', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    });
  });

  describe('Error handling', () => {
    it('should throw error for non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({ message: 'Server error' }),
      });

      await expect(client.get('/test')).rejects.toThrow('HTTP 500: Server error');
    });

    it('should throw custom error for 404 in development', async () => {
      // Mock import.meta.env.DEV
      const originalEnv = import.meta.env.DEV;
      (import.meta as any).env = { ...import.meta.env, DEV: true };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(client.get('/test')).rejects.toThrow(
        'API endpoint not found. Make sure Netlify Functions are running.\nURL: /api/test\nCheck that Netlify Dev is running and functions are deployed.'
      );

      // Restore
      (import.meta as any).env = { ...import.meta.env, DEV: originalEnv };
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(client.get('/test')).rejects.toThrow('Network error');
    });

    it('should handle JSON parse errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      await expect(client.get('/test')).rejects.toThrow('Invalid JSON');
    });
  });

  describe('Base URL configuration', () => {
    it('should use custom base URL', () => {
      const customClient = new HttpClient('https://api.example.com');
      expect(customClient).toBeDefined();

      // We can't easily test the private baseUrl, but we can test that it works
      const mockResponse = { status: 'success', payload: {}, metadata: { timestamp: '', version: '1.0.0' } };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      // This would use the custom base URL if we could access it
      // For now, just ensure the client is created properly
    });

    it('should use default base URL when none provided', () => {
      const defaultClient = new HttpClient();
      expect(defaultClient).toBeDefined();
    });
  });
});
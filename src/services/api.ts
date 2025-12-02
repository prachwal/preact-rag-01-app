/**
 * API service functions for communicating with the backend
 */

import { httpClient, type ApiResponse } from './http-client';

/**
 * Types for API data
 */
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface UsersResponse {
  users: User[];
}

export interface HealthResponse {
  healthy: boolean;
  uptime: number;
}

export interface GreetingResponse {
  message: string;
}

/**
 * API service functions
 */
export const apiService = {
  // Greeting endpoints
  async getGreeting(name?: string): Promise<ApiResponse<GreetingResponse>> {
    const trimmedName = name?.trim();
    const params = trimmedName != null && trimmedName !== '' ? { name: trimmedName } : undefined;
    return httpClient.get<GreetingResponse>('/', params);
  },

  async postGreeting(data: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    return httpClient.post('/', data);
  },

  // User endpoints
  async getUsers(): Promise<ApiResponse<UsersResponse>> {
    return httpClient.get<UsersResponse>('/users');
  },

  async getUser(id: string): Promise<ApiResponse<User>> {
    return httpClient.get<User>(`/users/${id}`);
  },

  async createUser(user: Omit<User, 'id'>): Promise<ApiResponse<{ message: string; user: User }>> {
    return httpClient.post('/users', user);
  },

  async updateUser(id: string, user: Partial<User>): Promise<ApiResponse<{ message: string; user: User }>> {
    return httpClient.put(`/users/${id}`, user);
  },

  async deleteUser(id: string): Promise<ApiResponse<{ message: string }>> {
    return httpClient.delete(`/users/${id}`);
  },

  // Health check
  async healthCheck(): Promise<ApiResponse<HealthResponse>> {
    return httpClient.get<HealthResponse>('/health');
  },
};

export default apiService;
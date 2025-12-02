/**
 * Mock API service for development when backend is not available
 */

import type { User, GreetingResponse, HealthResponse } from './api';
import type { ApiResponse } from './http-client';

// Mock API constants
const MOCK_CONFIG = {
  MAX_UPTIME: 100000,
  DELAYS: {
    SHORT: 200,
    MEDIUM: 300,
    LONG: 400,
    EXTRA_LONG: 500,
    USER_CREATE: 600,
  },
} as const;

// Mock data
const mockUsers: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  { id: '3', name: 'Bob Wilson', email: 'bob@example.com' },
  { id: '4', name: 'Alice Johnson', email: 'alice@example.com' },
  { id: '5', name: 'Charlie Brown', email: 'charlie@example.com' },
];

const mockHealthResponse: HealthResponse = {
  healthy: true,
  uptime: Math.random() * MOCK_CONFIG.MAX_UPTIME,
};

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API service
export const mockApiService = {
  // Greeting endpoints
  async getGreeting(name?: string): Promise<ApiResponse<GreetingResponse>> {
    await delay(MOCK_CONFIG.DELAYS.MEDIUM);
    const trimmedName = name?.trim();
    const message = trimmedName != null && trimmedName !== '' ? `Hello ${trimmedName}! (Mock API response)` : 'Hello World! (Mock API response)';
    
    return {
      status: 'success',
      payload: { message },
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0-mock',
      },
    };
  },

  async postGreeting(data: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    await delay(MOCK_CONFIG.DELAYS.LONG);
    return {
      status: 'success',
      payload: {
        message: 'Greeting received! (Mock API response)',
        received: data,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0-mock',
      },
    };
  },

  // User endpoints
  async getUsers(): Promise<ApiResponse<{ users: User[] }>> {
    await delay(MOCK_CONFIG.DELAYS.EXTRA_LONG);
    return {
      status: 'success',
      payload: { users: mockUsers },
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0-mock',
      },
    };
  },

  async getUser(id: string): Promise<ApiResponse<User>> {
    await delay(MOCK_CONFIG.DELAYS.MEDIUM);
    const user = mockUsers.find(u => u.id === id);
    if (!user) {
      throw new Error(`User ${id} not found`);
    }
    
    return {
      status: 'success',
      payload: user,
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0-mock',
      },
    };
  },

  async createUser(user: Omit<User, 'id'>): Promise<ApiResponse<{ message: string; user: User }>> {
    await delay(MOCK_CONFIG.DELAYS.USER_CREATE);
    const newUser: User = {
      ...user,
      id: String(Date.now()),
    };
    mockUsers.push(newUser);
    
    return {
      status: 'success',
      payload: {
        message: 'User created successfully! (Mock API response)',
        user: newUser,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0-mock',
      },
    };
  },

  async updateUser(id: string, user: Partial<User>): Promise<ApiResponse<{ message: string; user: User }>> {
    await delay(MOCK_CONFIG.DELAYS.EXTRA_LONG);
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error(`User ${id} not found`);
    }
    
    const updatedUser = { ...mockUsers[userIndex], ...user };
    mockUsers[userIndex] = updatedUser;
    
    return {
      status: 'success',
      payload: {
        message: `User ${id} updated successfully! (Mock API response)`,
        user: updatedUser,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0-mock',
      },
    };
  },

  async deleteUser(id: string): Promise<ApiResponse<{ message: string }>> {
    await delay(MOCK_CONFIG.DELAYS.LONG);
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error(`User ${id} not found`);
    }
    
    mockUsers.splice(userIndex, 1);
    
    return {
      status: 'success',
      payload: {
        message: `User ${id} deleted successfully! (Mock API response)`,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0-mock',
      },
    };
  },

  // Health check
  async healthCheck(): Promise<ApiResponse<HealthResponse>> {
    await delay(MOCK_CONFIG.DELAYS.SHORT);
    return {
      status: 'success',
      payload: mockHealthResponse,
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0-mock',
      },
    };
  },
};

export default mockApiService;
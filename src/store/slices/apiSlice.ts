/**
 * API slice using RTK Query for Redux state management
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { HealthResponse, GreetingResponse } from '../../services/api';

// Define the API response wrapper
interface ApiResponseWrapper<T> {
  status: string;
  payload: T;
  metadata: {
    timestamp: string;
    requestId: string;
  };
}

// Create the API slice
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      // Add any default headers here
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Greeting', 'Health', 'Users'],
  endpoints: (builder) => ({
    // Greeting endpoints
    getGreeting: builder.query<ApiResponseWrapper<GreetingResponse>, string | undefined>({
      query: (name) => {
        const trimmedName = name?.trim();
        const params = trimmedName != null && trimmedName !== '' ? { name: trimmedName } : undefined;
        return {
          url: '',
          params,
        };
      },
      providesTags: ['Greeting'],
    }),

    postGreeting: builder.mutation<ApiResponseWrapper<unknown>, Record<string, unknown>>({
      query: (data) => ({
        url: '',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Greeting'],
    }),

    // Health check endpoint
    getHealth: builder.query<ApiResponseWrapper<HealthResponse>, void>({
      query: () => 'health',
      providesTags: ['Health'],
    }),

    // Users endpoints
    getUsers: builder.query<ApiResponseWrapper<{ users: Array<{ id: string; name: string; email: string }> }>, void>({
      query: () => 'users',
      providesTags: ['Users'],
    }),

    getUser: builder.query<ApiResponseWrapper<{ id: string; name: string; email: string }>, string>({
      query: (id) => `users/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Users', id }],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetGreetingQuery,
  usePostGreetingMutation,
  useGetHealthQuery,
  useGetUsersQuery,
  useGetUserQuery,
} = apiSlice;

// Export the reducer
export default apiSlice.reducer;
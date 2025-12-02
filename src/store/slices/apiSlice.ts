/**
 * API slice for Redux state management (greeting, health, etc.)
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { apiService, type HealthResponse, type GreetingResponse } from '../../services/api';

export interface ApiState {
  greeting: string;
  health: HealthResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: ApiState = {
  greeting: '',
  health: null,
  loading: false,
  error: null,
};

/**
 * Async thunks for API operations
 */
export const fetchGreeting = createAsyncThunk<GreetingResponse, string | undefined, { rejectValue: string }>(
  'api/fetchGreeting',
  async (name, { rejectWithValue }) => {
    try {
      const response = await apiService.getGreeting(name);
      return response.payload;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch greeting';
      return rejectWithValue(message);
    }
  }
);

export const postGreeting = createAsyncThunk<unknown, Record<string, unknown>, { rejectValue: string }>(
  'api/postGreeting',
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiService.postGreeting(data);
      return response.payload;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to post greeting';
      return rejectWithValue(message);
    }
  }
);

export const checkHealth = createAsyncThunk<HealthResponse, void, { rejectValue: string }>(
  'api/checkHealth',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.healthCheck();
      return response.payload;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to check health';
      return rejectWithValue(message);
    }
  }
);

const apiSlice = createSlice({
  name: 'api',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearGreeting: (state) => {
      state.greeting = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch greeting
      .addCase(fetchGreeting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGreeting.fulfilled, (state, action: PayloadAction<GreetingResponse>) => {
        state.loading = false;
        state.greeting = action.payload.message;
      })
      .addCase(fetchGreeting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to fetch greeting';
      })
      
      // Post greeting
      .addCase(postGreeting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(postGreeting.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(postGreeting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to post greeting';
      })
      
      // Health check
      .addCase(checkHealth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkHealth.fulfilled, (state, action: PayloadAction<HealthResponse>) => {
        state.loading = false;
        state.health = action.payload;
      })
      .addCase(checkHealth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to check health';
      });
  },
});

export const { clearError, clearGreeting } = apiSlice.actions;
export default apiSlice.reducer;
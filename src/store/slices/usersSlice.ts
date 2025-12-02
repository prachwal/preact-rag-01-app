/**
 * Users slice for Redux state management
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { apiService, type User, type UsersResponse } from '../../services/api';

export interface UsersState {
  users: User[];
  selectedUser: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  selectedUser: null,
  loading: false,
  error: null,
};

/**
 * Async thunks for API operations
 */
export const fetchUsers = createAsyncThunk<UsersResponse, void, { rejectValue: string }>(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getUsers();
      return response.payload;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch users';
      return rejectWithValue(message);
    }
  }
);

export const fetchUserById = createAsyncThunk<User, string, { rejectValue: string }>(
  'users/fetchUserById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.getUser(id);
      return response.payload;
    } catch (error) {
      const message = error instanceof Error ? error.message : `Failed to fetch user ${id}`;
      return rejectWithValue(message);
    }
  }
);

export const createUser = createAsyncThunk<
  { message: string; user: User },
  Omit<User, 'id'>,
  { rejectValue: string }
>('users/createUser', async (userData, { rejectWithValue }) => {
  try {
    const response = await apiService.createUser(userData);
    return response.payload;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create user';
    return rejectWithValue(message);
  }
});

export const updateUser = createAsyncThunk<
  { message: string; user: User },
  { id: string; updates: Partial<User> },
  { rejectValue: string }
>('users/updateUser', async ({ id, updates }, { rejectWithValue }) => {
  try {
    const response = await apiService.updateUser(id, updates);
    return response.payload;
  } catch (error) {
    const message = error instanceof Error ? error.message : `Failed to update user ${id}`;
    return rejectWithValue(message);
  }
});

export const deleteUser = createAsyncThunk<string, string, { rejectValue: string }>(
  'users/deleteUser',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.deleteUser(id);
      return id; // Return the deleted user ID
    } catch (error) {
      const message = error instanceof Error ? error.message : `Failed to delete user ${id}`;
      return rejectWithValue(message);
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    selectUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to fetch users';
      })
      
      // Fetch user by ID
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;
        
        // Update in users array if exists
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        } else {
          state.users.push(action.payload);
        }
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? `Failed to fetch user`;
      })
      
      // Create user
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload.user);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to create user';
      })
      
      // Update user
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(user => user.id === action.payload.user.id);
        if (index !== -1) {
          state.users[index] = action.payload.user;
        }
        if (state.selectedUser?.id === action.payload.user.id) {
          state.selectedUser = action.payload.user;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to update user';
      })
      
      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(user => user.id !== action.payload);
        if (state.selectedUser?.id === action.payload) {
          state.selectedUser = null;
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to delete user';
      });
  },
});

export const { clearError, selectUser } = usersSlice.actions;
export default usersSlice.reducer;
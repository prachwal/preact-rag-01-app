/**
 * Redux store exports
 */

export { store, useAppDispatch, useAppSelector } from './store';
export type { RootState, AppDispatch } from './store';

// Slices
export { default as usersReducer } from './slices/usersSlice';
export { default as apiReducer } from './slices/apiSlice';

// Actions and thunks
export {
  fetchUsers,
  fetchUserById,
  createUser,
  updateUser,
  deleteUser,
  clearError,
  selectUser,
} from './slices/usersSlice';

export {
  fetchGreeting,
  postGreeting,
  checkHealth,
  clearError as clearApiError,
  clearGreeting,
} from './slices/apiSlice';
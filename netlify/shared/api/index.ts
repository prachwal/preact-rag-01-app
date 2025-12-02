/**
 * API Export Hub
 * Application-specific route handlers and business logic
 */

// Route handlers
export {
  getGreeting,
  getUserById,
  healthCheck,
  optionsCors,
  postData,
} from './routes/api.routes.ts';

// Router configuration
export { router } from './routes/index.ts';

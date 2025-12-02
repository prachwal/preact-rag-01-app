/**
 * Main API Router - Single entry point for all routes
 */

import { createRouter } from '../../lib/types/router.types.ts';
import { getGreeting, healthCheck, optionsCors, postData } from './api.routes.ts';
import { usersRouter } from './users.routes.ts';
import { HTTP_STATUS } from '../../lib/constants/http.constants.ts';
import {
  apiCors,
  createLogger,
  apiRateLimiter
} from '../../lib/middleware/index.ts';

// ============================================================================
// Create API Router - All API routes grouped under /api
// ============================================================================

const apiRouter = createRouter();

// Apply middleware to API routes
apiRouter.use(apiCors);
apiRouter.use(createLogger());
apiRouter.use(apiRateLimiter);

// API routes (root of apiRouter -> /api in main router)
apiRouter.get('/', getGreeting);
apiRouter.post('/', postData);
apiRouter.options('/', optionsCors);

// Health check endpoint
apiRouter.get('/health', healthCheck);

// Mount users sub-router under API
apiRouter.use('/users', usersRouter);

// ============================================================================
// Create main router
// ============================================================================

const router = createRouter();

// Mount all API routes under /api prefix
router.use('/api', apiRouter);

// Root route for non-API endpoints (if needed)
router.get('/', (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    status: 'success',
    message: 'API available at /api',
    endpoints: {
      api: '/api',
      users: '/api/users',
      health: '/api/health'
    }
  });
});

// ============================================================================
// Export configured router
// ============================================================================

export { router };

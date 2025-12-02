/**
 * Express-like route handlers for the API
 */

import type { ExpressRequest, ExpressResponse } from '../../lib/types/router.types.ts';
import { HTTP_STATUS } from '../../lib/constants/http.constants.ts';

/**
 * GET / - Returns greeting message
 */
export const getGreeting = (req: ExpressRequest, res: ExpressResponse): void => {
  const nameParam = req.query['name'];
  const trimmedName = nameParam?.trim();
  const subject = trimmedName !== undefined && trimmedName !== '' ? trimmedName : 'World';

  const errorHeader = req.headers.get('x-trigger-error') === 'true';
  if (errorHeader) {
    throw new Error('Simulated error triggered by x-trigger-error header');
  }

  res.status(HTTP_STATUS.OK).json({
    status: 'success',
    payload: { message: `Hello ${subject}` },
    metadata: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  });
};

/**
 * POST / - Processes request body
 */
export const postData = (req: ExpressRequest, res: ExpressResponse): void => {
  res.status(HTTP_STATUS.CREATED).json({
    status: 'success',
    payload: {
      message: 'Data received successfully',
      received: req.body,
    },
    metadata: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  });
};

/**
 * OPTIONS / - CORS preflight
 */
export const optionsCors = (_req: ExpressRequest, res: ExpressResponse): void => {
  res.status(HTTP_STATUS.NO_CONTENT).json({
    status: 'success',
    metadata: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  });
};

/**
 * GET /users/:id - Get user by ID
 * @deprecated Use usersRouter instead
 */
export const getUserById = (req: ExpressRequest, res: ExpressResponse): void => {
  const userId = req.params['id'];

  res.status(HTTP_STATUS.OK).json({
    status: 'success',
    payload: {
      id: userId,
      name: `User ${userId}`,
      email: `user${userId}@example.com`,
    },
    metadata: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  });
};

/**
 * GET /health - Health check endpoint
 */
export const healthCheck = (_req: ExpressRequest, res: ExpressResponse): void => {
  res.status(HTTP_STATUS.OK).json({
    status: 'success',
    payload: {
      healthy: true,
      uptime: process.uptime(),
    },
    metadata: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  });
};

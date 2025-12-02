/**
 * Users sub-router (Express-like cascading router)
 */

import { createRouter, type ExpressRequest, type ExpressResponse } from '../../lib/types/router.types.ts';
import { HTTP_STATUS } from '../../lib/constants/http.constants.ts';

// Create users sub-router
export const usersRouter = createRouter();

/**
 * GET /users - List all users
 */
usersRouter.get('/', (_req: ExpressRequest, res: ExpressResponse): void => {
  res.status(HTTP_STATUS.OK).json({
    status: 'success',
    payload: {
      users: [
        { id: '1', name: 'John Doe', email: 'john@example.com' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
        { id: '3', name: 'Bob Wilson', email: 'bob@example.com' },
      ],
    },
    metadata: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  });
});

/**
 * GET /users/:id - Get user by ID
 */
usersRouter.get('/:id', (req: ExpressRequest, res: ExpressResponse): void => {
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
});

/**
 * POST /users - Create new user
 */
usersRouter.post('/', (req: ExpressRequest, res: ExpressResponse): void => {
  res.status(HTTP_STATUS.CREATED).json({
    status: 'success',
    payload: {
      message: 'User created successfully',
      user: req.body,
    },
    metadata: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  });
});

/**
 * PUT /users/:id - Update user
 */
usersRouter.put('/:id', (req: ExpressRequest, res: ExpressResponse): void => {
  const userId = req.params['id'];

  res.status(HTTP_STATUS.OK).json({
    status: 'success',
    payload: {
      message: `User ${userId} updated successfully`,
      user: { id: userId, ...req.body as object },
    },
    metadata: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  });
});

/**
 * DELETE /users/:id - Delete user
 */
usersRouter.delete('/:id', (req: ExpressRequest, res: ExpressResponse): void => {
  const userId = req.params['id'];

  res.status(HTTP_STATUS.OK).json({
    status: 'success',
    payload: {
      message: `User ${userId} deleted successfully`,
    },
    metadata: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  });
});

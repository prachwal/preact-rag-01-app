import type { Context } from '@netlify/functions';
import { router } from '../../shared/api/routes/index.ts';

/**
 * Main API Handler
 * Single entry point - all routing is configured in shared/api/routes/index.ts
 */
export default async (request: Request, _context: Context): Promise<Response> => {
  return router.handle(request);
};

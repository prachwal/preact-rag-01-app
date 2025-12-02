/**
 * Validation Middleware
 * Request/response validation with comprehensive error handling
 */

import type { ExpressRequest, ExpressResponse } from '../types/router.types.ts';
import { HTTP_STATUS } from '../constants/http.constants.ts';

// Validation rule types
export type ValidationRule = 
  | { type: 'string'; required?: boolean; minLength?: number; maxLength?: number; pattern?: RegExp }
  | { type: 'number'; required?: boolean; min?: number; max?: number; integer?: boolean }
  | { type: 'boolean'; required?: boolean }
  | { type: 'array'; required?: boolean; items?: ValidationRule }
  | { type: 'object'; required?: boolean; properties?: Record<string, ValidationRule> };

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrorItem[];
}

export interface ValidationErrorItem {
  field: string;
  message: string;
  code: string;
  value?: unknown;
}

// Schema definition
export interface ValidationSchema {
  [key: string]: ValidationRule;
}

// Custom validation function
export type CustomValidator = (value: unknown, data: Record<string, unknown>) => string | null;

/**
 * Validate a single value against a rule
 */
function validateValue(
  value: unknown,
  rule: ValidationRule,
  fieldName: string,
  data: Record<string, unknown> = {}
): ValidationErrorItem | null {
  // Handle required fields
  if (rule.required && (value === undefined || value === null)) {
    return {
      field: fieldName,
      message: `${fieldName} is required`,
      code: 'REQUIRED_FIELD_MISSING',
      value
    };
  }

  // If field is not required and value is empty, it's valid
  if (!rule.required && (value === undefined || value === null)) {
    return null;
  }

  // Type-specific validation
  switch (rule.type) {
    case 'string':
      if (typeof value !== 'string') {
        return {
          field: fieldName,
          message: `${fieldName} must be a string`,
          code: 'INVALID_TYPE',
          value
        };
      }

      if (rule.minLength !== undefined && value.length < rule.minLength) {
        return {
          field: fieldName,
          message: `${fieldName} must be at least ${rule.minLength} characters`,
          code: 'STRING_TOO_SHORT',
          value
        };
      }

      if (rule.maxLength !== undefined && value.length > rule.maxLength) {
        return {
          field: fieldName,
          message: `${fieldName} must be no more than ${rule.maxLength} characters`,
          code: 'STRING_TOO_LONG',
          value
        };
      }

      if (rule.pattern && !rule.pattern.test(value)) {
        return {
          field: fieldName,
          message: `${fieldName} format is invalid`,
          code: 'INVALID_FORMAT',
          value
        };
      }
      break;

    case 'number':
      if (typeof value !== 'number' || isNaN(value)) {
        return {
          field: fieldName,
          message: `${fieldName} must be a valid number`,
          code: 'INVALID_TYPE',
          value
        };
      }

      if (rule.integer && !Number.isInteger(value)) {
        return {
          field: fieldName,
          message: `${fieldName} must be an integer`,
          code: 'NOT_AN_INTEGER',
          value
        };
      }

      if (rule.min !== undefined && value < rule.min) {
        return {
          field: fieldName,
          message: `${fieldName} must be at least ${rule.min}`,
          code: 'NUMBER_TOO_SMALL',
          value
        };
      }

      if (rule.max !== undefined && value > rule.max) {
        return {
          field: fieldName,
          message: `${fieldName} must be no more than ${rule.max}`,
          code: 'NUMBER_TOO_LARGE',
          value
        };
      }
      break;

    case 'boolean':
      if (typeof value !== 'boolean') {
        return {
          field: fieldName,
          message: `${fieldName} must be a boolean`,
          code: 'INVALID_TYPE',
          value
        };
      }
      break;

    case 'array':
      if (!Array.isArray(value)) {
        return {
          field: fieldName,
          message: `${fieldName} must be an array`,
          code: 'INVALID_TYPE',
          value
        };
      }

      if (rule.items) {
        for (let i = 0; i < value.length; i++) {
          const itemError = validateValue(value[i], rule.items, `${fieldName}[${i}]`, data);
          if (itemError) {
            return itemError;
          }
        }
      }
      break;

    case 'object':
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return {
          field: fieldName,
          message: `${fieldName} must be an object`,
          code: 'INVALID_TYPE',
          value
        };
      }

      if (rule.properties) {
        const objValue = value as Record<string, unknown>;
        for (const [key, childRule] of Object.entries(rule.properties)) {
          const itemError = validateValue(objValue[key], childRule, `${fieldName}.${key}`, data);
          if (itemError) {
            return itemError;
          }
        }
      }
      break;
  }

  return null;
}

/**
 * Validate data against schema
 */
function validateData(data: Record<string, unknown>, schema: ValidationSchema): ValidationResult {
  const errors: ValidationErrorItem[] = [];

  for (const [fieldName, rule] of Object.entries(schema)) {
    const error = validateValue(data[fieldName], rule, fieldName, data);
    if (error) {
      errors.push(error);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Create body validation middleware
 */
export function validateBody(schema: ValidationSchema): (req: ExpressRequest, res: ExpressResponse, next: () => void) => void {
  return (req: ExpressRequest, res: ExpressResponse, next: () => void): void => {
    const body = req.body;

    if (!body || typeof body !== 'object') {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: 'error',
        error: {
          code: 'INVALID_BODY',
          message: 'Request body must be a valid JSON object',
        },
        metadata: {
          timestamp: new Date().toISOString(),
          processingTimeMs: 0,
        },
      });
      return;
    }

    const result = validateData(body as Record<string, unknown>, schema);

    if (!result.isValid) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: 'error',
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Request validation failed',
          details: {
            errors: result.errors
          }
        },
        metadata: {
          timestamp: new Date().toISOString(),
          processingTimeMs: 0,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Create query validation middleware
 */
export function validateQuery(schema: ValidationSchema): (req: ExpressRequest, res: ExpressResponse, next: () => void) => void {
  return (req: ExpressRequest, res: ExpressResponse, next: () => void): void => {
    const query = req.query;

    if (!query || typeof query !== 'object') {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: 'error',
        error: {
          code: 'INVALID_QUERY',
          message: 'Query parameters must be valid',
        },
        metadata: {
          timestamp: new Date().toISOString(),
          processingTimeMs: 0,
        },
      });
      return;
    }

    const result = validateData(query, schema);

    if (!result.isValid) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: 'error',
        error: {
          code: 'QUERY_VALIDATION_FAILED',
          message: 'Query parameter validation failed',
          details: {
            errors: result.errors
          }
        },
        metadata: {
          timestamp: new Date().toISOString(),
          processingTimeMs: 0,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Create params validation middleware
 */
export function validateParams(schema: ValidationSchema): (req: ExpressRequest, res: ExpressResponse, next: () => void) => void {
  return (req: ExpressRequest, res: ExpressResponse, next: () => void): void => {
    const params = req.params;

    if (!params || typeof params !== 'object') {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: 'error',
        error: {
          code: 'INVALID_PARAMS',
          message: 'Route parameters must be valid',
        },
        metadata: {
          timestamp: new Date().toISOString(),
          processingTimeMs: 0,
        },
      });
      return;
    }

    const result = validateData(params, schema);

    if (!result.isValid) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: 'error',
        error: {
          code: 'PARAMS_VALIDATION_FAILED',
          message: 'Route parameter validation failed',
          details: {
            errors: result.errors
          }
        },
        metadata: {
          timestamp: new Date().toISOString(),
          processingTimeMs: 0,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Create combined validation middleware
 */
export function validateAll(config: {
  body?: ValidationSchema;
  query?: ValidationSchema;
  params?: ValidationSchema;
}): (req: ExpressRequest, res: ExpressResponse, next: () => void) => void {
  return (req: ExpressRequest, res: ExpressResponse, next: () => void): void => {
    const errors: ValidationErrorItem[] = [];

    // Validate body
    if (config.body && req.body) {
      const bodyResult = validateData(req.body as Record<string, unknown>, config.body);
      if (!bodyResult.isValid) {
        errors.push(...bodyResult.errors.map(err => ({ ...err, field: `body.${err.field}` })));
      }
    }

    // Validate query
    if (config.query && req.query) {
      const queryResult = validateData(req.query, config.query);
      if (!queryResult.isValid) {
        errors.push(...queryResult.errors.map(err => ({ ...err, field: `query.${err.field}` })));
      }
    }

    // Validate params
    if (config.params && req.params) {
      const paramsResult = validateData(req.params, config.params);
      if (!paramsResult.isValid) {
        errors.push(...paramsResult.errors.map(err => ({ ...err, field: `params.${err.field}` })));
      }
    }

    if (errors.length > 0) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: 'error',
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Request validation failed',
          details: {
            errors
          }
        },
        metadata: {
          timestamp: new Date().toISOString(),
          processingTimeMs: 0,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Common validation schemas
 */
export const commonSchemas = {
  // UUID validation
  uuid: { type: 'string' as const, required: true, pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i },
  
  // Email validation
  email: { type: 'string' as const, required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  
  // Pagination
  pagination: {
    page: { type: 'number' as const, required: false, min: 1 },
    limit: { type: 'number' as const, required: false, min: 1, max: 100 }
  },
  
  // User ID
  userId: { type: 'string' as const, required: true, minLength: 1 },
  
  // Search
  search: { type: 'string' as const, required: false, maxLength: 100 },
  
  // Boolean flag
  flag: { type: 'boolean' as const, required: false }
};
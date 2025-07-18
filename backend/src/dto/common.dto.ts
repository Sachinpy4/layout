// Common response interfaces and DTOs

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  message?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface BaseQueryDto extends PaginationQuery {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

// Success response helper
export class SuccessResponse<T> {
  success: boolean = true;
  data: T;
  message?: string;

  constructor(data: T, message?: string) {
    this.data = data;
    this.message = message;
  }
}

// Error response helper
export class ErrorResponse {
  success: boolean = false;
  message: string;
  errors?: string[];
  statusCode?: number;

  constructor(message: string, errors?: string[], statusCode?: number) {
    this.message = message;
    this.errors = errors;
    this.statusCode = statusCode;
  }
}

// Validation error response
export class ValidationErrorResponse extends ErrorResponse {
  constructor(errors: string[]) {
    super('Validation failed', errors, 400);
  }
}

// Not found error response
export class NotFoundResponse extends ErrorResponse {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, undefined, 404);
  }
}

// Unauthorized error response
export class UnauthorizedResponse extends ErrorResponse {
  constructor(message: string = 'Unauthorized') {
    super(message, undefined, 401);
  }
}

// Forbidden error response
export class ForbiddenResponse extends ErrorResponse {
  constructor(message: string = 'Forbidden') {
    super(message, undefined, 403);
  }
}

// File upload response
export interface FileUploadResponse {
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  url: string;
  path: string;
}

// Basic ID parameter
export interface ParamId {
  id: string;
} 
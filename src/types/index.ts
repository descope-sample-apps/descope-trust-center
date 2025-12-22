/**
 * Global type definitions for the Descope Trust Center project
 */

// API Response types
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  status?: number;
}

// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

// API Configuration
export interface ApiConfig {
  baseUrl?: string;
  headers?: Record<string, string>;
  timeout?: number;
}

// Component Props
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Theme types
export type Theme = 'light' | 'dark' | 'system';

// Environment configuration
export interface EnvConfig {
  apiUrl: string;
  environment: 'development' | 'production' | 'test';
  version: string;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T = any> {
  data: T;
  errors: ValidationError[];
  isValid: boolean;
  isDirty: boolean;
}
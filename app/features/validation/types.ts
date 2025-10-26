/**
 * Type definitions for validation system
 */

export interface DimensionValue {
  width: string;
  height: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface DimensionValidationResult {
  width: ValidationResult;
  height: ValidationResult;
  isValid: boolean;
}

export interface ClampedValue {
  value: number;
  wasClamped: boolean;
  originalValue: number;
}

export type DimensionField = 'width' | 'height';

export interface DimensionConstraint {
  min: number;
  max: number;
  default: number;
  unit: string;
}

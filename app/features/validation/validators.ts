/**
 * Validation functions for plate dimensions
 */

import { DIMENSION_CONSTRAINTS, PLATE_CONSTRAINTS } from './constants';
import type {
  ValidationResult,
  DimensionValidationResult,
  ClampedValue,
  DimensionField,
  DimensionValue,
} from './types';

/**
 * Validates if a string can be parsed as a valid number
 */
export function isValidNumber(value: string): boolean {
  if (!value || value.trim() === '') return false;
  const num = parseFloat(value);
  return !isNaN(num) && isFinite(num);
}

/**
 * Validates if a dimension value is within acceptable range
 */
export function validateDimensionValue(
  value: string,
  field: DimensionField
): ValidationResult {
  // Check if it's a valid number
  if (!isValidNumber(value)) {
    return {
      isValid: false,
      error: 'Please enter a valid number',
    };
  }

  const numValue = parseFloat(value);
  const constraint = DIMENSION_CONSTRAINTS[field];

  // Check minimum
  if (numValue < constraint.min) {
    return {
      isValid: false,
      error: `Minimum ${field} is ${constraint.min}${constraint.unit}`,
    };
  }

  // Check maximum
  if (numValue > constraint.max) {
    return {
      isValid: false,
      error: `Maximum ${field} is ${constraint.max}${constraint.unit}`,
    };
  }

  return { isValid: true };
}

/**
 * Validates complete dimension object (width and height)
 */
export function validateDimensions(
  dimension: DimensionValue
): DimensionValidationResult {
  const widthValidation = validateDimensionValue(dimension.width, 'width');
  const heightValidation = validateDimensionValue(dimension.height, 'height');

  return {
    width: widthValidation,
    height: heightValidation,
    isValid: widthValidation.isValid && heightValidation.isValid,
  };
}

/**
 * Validates an array of dimensions
 */
export function validateAllDimensions(dimensions: DimensionValue[]): boolean {
  return dimensions.every((dim) => validateDimensions(dim).isValid);
}

/**
 * Clamps a value to be within valid range
 */
export function clampDimensionValue(
  value: string,
  field: DimensionField
): ClampedValue {
  if (!isValidNumber(value)) {
    const defaultValue = DIMENSION_CONSTRAINTS[field].default;
    return {
      value: defaultValue,
      wasClamped: true,
      originalValue: NaN,
    };
  }

  const numValue = parseFloat(value);
  const constraint = DIMENSION_CONSTRAINTS[field];
  const clampedValue = Math.max(
    constraint.min,
    Math.min(constraint.max, numValue)
  );

  return {
    value: clampedValue,
    wasClamped: clampedValue !== numValue,
    originalValue: numValue,
  };
}

/**
 * Clamps dimension object (width and height)
 */
export function clampDimensions(dimension: DimensionValue): DimensionValue {
  const clampedWidth = clampDimensionValue(dimension.width, 'width');
  const clampedHeight = clampDimensionValue(dimension.height, 'height');

  return {
    width: clampedWidth.value.toString(),
    height: clampedHeight.value.toString(),
  };
}

/**
 * Validates if the number of plates is within acceptable range
 */
export function validatePlateCount(count: number): ValidationResult {
  if (count < PLATE_CONSTRAINTS.minPlates) {
    return {
      isValid: false,
      error: `Minimum ${PLATE_CONSTRAINTS.minPlates} plate(s) required`,
    };
  }

  if (count > PLATE_CONSTRAINTS.maxPlates) {
    return {
      isValid: false,
      error: `Maximum ${PLATE_CONSTRAINTS.maxPlates} plates allowed`,
    };
  }

  return { isValid: true };
}

/**
 * Checks if a plate can be deleted (minimum 1 must remain)
 */
export function canDeletePlate(currentCount: number): boolean {
  return currentCount > PLATE_CONSTRAINTS.minPlates;
}

/**
 * Formats dimension value to specified decimal places
 */
export function formatDimensionValue(value: string, decimals = 1): string {
  if (!isValidNumber(value)) return value;
  return parseFloat(value).toFixed(decimals);
}

/**
 * Converts cm to mm
 */
export function cmToMm(cm: string | number): number {
  const value = typeof cm === 'string' ? parseFloat(cm) : cm;
  return isNaN(value) ? 0 : value * 10;
}

/**
 * Converts mm to cm
 */
export function mmToCm(mm: string | number): number {
  const value = typeof mm === 'string' ? parseFloat(mm) : mm;
  return isNaN(value) ? 0 : value / 10;
}

/**
 * Gets dimension constraint for a specific field
 */
export function getDimensionConstraint(field: DimensionField) {
  return DIMENSION_CONSTRAINTS[field];
}

/**
 * Creates a default dimension object
 */
export function createDefaultDimension(): DimensionValue {
  return {
    width: String(DIMENSION_CONSTRAINTS.width.default),
    height: String(DIMENSION_CONSTRAINTS.height.default),
  };
}

/**
 * Sanitizes input value (removes invalid characters, handles edge cases)
 */
export function sanitizeNumericInput(value: string): string {
  // Remove non-numeric characters except decimal point and minus
  let sanitized = value.replace(/[^\d.-]/g, '');

  // Ensure only one decimal point
  const parts = sanitized.split('.');
  if (parts.length > 2) {
    sanitized = parts[0] + '.' + parts.slice(1).join('');
  }

  // Ensure minus only at start
  if (sanitized.includes('-')) {
    const hasLeadingMinus = sanitized.startsWith('-');
    sanitized = sanitized.replace(/-/g, '');
    if (hasLeadingMinus) sanitized = '-' + sanitized;
  }

  return sanitized;
}

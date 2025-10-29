/**
 * Validation module - Simplified version
 */

// Constants
export {
  DIMENSION_CONSTRAINTS,
  PLATE_CONSTRAINTS,
  INITIAL_PLATE_DIMENSION,
} from './constants';

// Types
export type {
  DimensionValue,
  ValidationResult,
  DimensionValidationResult,
  ClampedValue,
  DimensionField,
  DimensionConstraint,
} from './types';

// Validators
export {
  isValidNumber,
  validateDimensionValue,
  validateDimensions,
  validateAllDimensions,
  clampDimensionValue,
  clampDimensions,
  validatePlateCount,
  canDeletePlate,
  formatDimensionValue,
  cmToMm,
  mmToCm,
  getDimensionConstraint,
  createDefaultDimension,
  sanitizeNumericInput,
} from './validators';

// Hooks
export { usePersistedDimensions } from '../../hooks/hooks';

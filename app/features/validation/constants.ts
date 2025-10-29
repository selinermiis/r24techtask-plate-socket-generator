/**
 * Dimension constraints for plate validation
 */

import type { DimensionValue } from './types';

export const DIMENSION_CONSTRAINTS = {
  width: {
    min: 20,
    max: 300,
    default: 200,
    unit: 'cm',
  },
  height: {
    min: 30,
    max: 128,
    default: 100,
    unit: 'cm',
  },
} as const;

export const PLATE_CONSTRAINTS = {
  minPlates: 1,
  maxPlates: Infinity, // No limit
} as const;

export const INITIAL_PLATE_DIMENSION: DimensionValue = {
  width: '151.5',
  height: '40',
};

/**
 * React hooks for dimension validation and localStorage
 */

import { useMemo, useCallback, useState, useEffect } from 'react';
import type {
  DimensionValue,
  DimensionField,
} from '../features/validation/types';
import { INITIAL_PLATE_DIMENSION } from '../features/validation/constants';
import {
  validateDimensions,
  validateAllDimensions,
  clampDimensionValue,
  sanitizeNumericInput,
  getDimensionConstraint,
} from '../features/validation/validators';

/**
 * Hook for validating a single dimension
 */
export function useDimensionValidation(dimension: DimensionValue) {
  const validation = useMemo(
    () => validateDimensions(dimension),
    [dimension.width, dimension.height]
  );

  return validation;
}

/**
 * Hook for validating multiple dimensions
 */
export function useMultipleDimensionsValidation(dimensions: DimensionValue[]) {
  const isValid = useMemo(
    () => validateAllDimensions(dimensions),
    [dimensions]
  );

  const validationResults = useMemo(
    () => dimensions.map((dim) => validateDimensions(dim)),
    [dimensions]
  );

  return {
    isValid,
    validationResults,
  };
}

/**
 * Hook for handling dimension input with validation and sanitization
 */
export function useDimensionInput(
  value: string,
  field: DimensionField,
  onChange: (value: string) => void,
  options: {
    autoClamp?: boolean;
    sanitize?: boolean;
  } = {}
) {
  const { autoClamp = false, sanitize = true } = options;

  const constraint = getDimensionConstraint(field);

  const handleChange = useCallback(
    (newValue: string) => {
      let processedValue = newValue;

      // Sanitize input
      if (sanitize) {
        processedValue = sanitizeNumericInput(processedValue);
      }

      // Auto-clamp if enabled
      if (autoClamp) {
        const clamped = clampDimensionValue(processedValue, field);
        processedValue = clamped.value.toString();
      }

      onChange(processedValue);
    },
    [field, onChange, autoClamp, sanitize]
  );

  const handleBlur = useCallback(() => {
    if (autoClamp && value) {
      const clamped = clampDimensionValue(value, field);
      if (clamped.wasClamped) {
        onChange(clamped.value.toString());
      }
    }
  }, [value, field, onChange, autoClamp]);

  return {
    value,
    onChange: handleChange,
    onBlur: handleBlur,
    constraint,
  };
}

/**
 * Basit localStorage hook - Client-only için
 */
export function usePersistedDimensions() {
  const [dimensions, setDimensionsState] = useState<DimensionValue[]>([
    INITIAL_PLATE_DIMENSION,
  ]);
  const [activeIndex, setActiveIndexState] = useState<number>(0);
  const [mounted, setMounted] = useState(false);

  // İlk yüklemede localStorage'dan oku
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('dimensions');
      const savedIndex = localStorage.getItem('activeIndex');
      if (saved) {
        const parsed = JSON.parse(saved);
        setDimensionsState(parsed);
        if (savedIndex) setActiveIndexState(parseInt(savedIndex));
      }
    } catch (e) {
      console.error('localStorage okuma hatası:', e);
    }
  }, []);

  // Dimensions değiştiğinde localStorage'a kaydet
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem('dimensions', JSON.stringify(dimensions));
        console.log('✅ localStorage kayıt:', { dimensions });
      } catch (e) {
        console.error('localStorage yazma hatası:', e);
      }
    }
  }, [dimensions, mounted]);

  // ActiveIndex değiştiğinde localStorage'a kaydet
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem('activeIndex', String(activeIndex));
        console.log('✅ activeIndex kayıt:', activeIndex);
      } catch (e) {
        console.error('localStorage yazma hatası:', e);
      }
    }
  }, [activeIndex, mounted]);

  return {
    dimensions,
    setDimensions: setDimensionsState,
    activeIndex,
    setActiveIndex: setActiveIndexState,
  };
}

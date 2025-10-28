/**
 * React hooks for localStorage persistence
 */

import { useState, useEffect } from 'react';
import type { DimensionValue } from '../features/validation/types';
import { INITIAL_PLATE_DIMENSION } from '../features/validation/constants';

/**
 * localStorage hook for persisting dimensions
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

'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { usePersistedDimensions } from '@/app/hooks/hooks';
import type { DimensionValue } from '@/app/features/validation/types';

interface PlateContextType {
  dimensions: DimensionValue[];
  setDimensions: React.Dispatch<React.SetStateAction<DimensionValue[]>>;
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
}

const PlateContext = createContext<PlateContextType | undefined>(undefined);

export function PlateProvider({ children }: { children: ReactNode }) {
  const { dimensions, setDimensions, activeIndex, setActiveIndex } =
    usePersistedDimensions();

  return (
    <PlateContext.Provider
      value={{ dimensions, setDimensions, activeIndex, setActiveIndex }}
    >
      {children}
    </PlateContext.Provider>
  );
}

export function usePlateContext() {
  const context = useContext(PlateContext);
  if (context === undefined) {
    throw new Error('usePlateContext must be used within a PlateProvider');
  }
  return context;
}

'use client';

import React, { createContext, useContext, ReactNode, useState } from 'react';
import { usePersistedDimensions } from '@/app/hooks/hooks';
import type { DimensionValue } from '@/app/features/validation/types';

export interface Socket {
  id: string;
  plateIndex: number;
  count: number;
  orientation: 'horizontal' | 'vertical';
  leftDistance: string;
  bottomDistance: string;
}

interface PlateContextType {
  dimensions: DimensionValue[];
  setDimensions: React.Dispatch<React.SetStateAction<DimensionValue[]>>;
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
  cutoutsEnabled: boolean;
  setCutoutsEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  selectedPlateForSocket: number | null;
  setSelectedPlateForSocket: React.Dispatch<
    React.SetStateAction<number | null>
  >;
  socketCount: number;
  setSocketCount: React.Dispatch<React.SetStateAction<number>>;
  socketOrientation: 'horizontal' | 'vertical';
  setSocketOrientation: React.Dispatch<
    React.SetStateAction<'horizontal' | 'vertical'>
  >;
  sockets: Socket[];
  setSockets: React.Dispatch<React.SetStateAction<Socket[]>>;
}

const PlateContext = createContext<PlateContextType | undefined>(undefined);

export function PlateProvider({ children }: { children: ReactNode }) {
  const { dimensions, setDimensions, activeIndex, setActiveIndex } =
    usePersistedDimensions();

  const [cutoutsEnabled, setCutoutsEnabled] = useState(true);
  const [selectedPlateForSocket, setSelectedPlateForSocket] = useState<
    number | null
  >(null);
  const [socketCount, setSocketCount] = useState(1);
  const [socketOrientation, setSocketOrientation] = useState<
    'horizontal' | 'vertical'
  >('vertical');
  const [sockets, setSockets] = useState<Socket[]>([]);

  return (
    <PlateContext.Provider
      value={{
        dimensions,
        setDimensions,
        activeIndex,
        setActiveIndex,
        cutoutsEnabled,
        setCutoutsEnabled,
        selectedPlateForSocket,
        setSelectedPlateForSocket,
        socketCount,
        setSocketCount,
        socketOrientation,
        setSocketOrientation,
        sockets,
        setSockets,
      }}
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

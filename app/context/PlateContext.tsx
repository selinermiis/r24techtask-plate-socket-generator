'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import {
  usePersistedDimensions,
  usePersistedSocketData,
} from '@/app/hooks/hooks';
import type { DimensionValue } from '@/app/features/validation/types';
import type { Socket, PlateContextType } from '@/app/types';

const PlateContext = createContext<
  PlateContextType<DimensionValue> | undefined
>(undefined);

export function PlateProvider({ children }: { children: ReactNode }) {
  const { dimensions, setDimensions, activeIndex, setActiveIndex } =
    usePersistedDimensions();

  const {
    cutoutsEnabled,
    setCutoutsEnabled,
    selectedPlateForSocket,
    setSelectedPlateForSocket,
    socketCount,
    setSocketCount,
    socketOrientation,
    setSocketOrientation,
    distanceLeft,
    setDistanceLeft,
    distanceBottom,
    setDistanceBottom,
    sockets,
    setSockets,
    activeSocketId,
    setActiveSocketId,
    editingSocketId,
    setEditingSocketId,
  } = usePersistedSocketData();

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
        distanceLeft,
        setDistanceLeft,
        distanceBottom,
        setDistanceBottom,
        sockets,
        setSockets,
        activeSocketId,
        setActiveSocketId,
        editingSocketId,
        setEditingSocketId,
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

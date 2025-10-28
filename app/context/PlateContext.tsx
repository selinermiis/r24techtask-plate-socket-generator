'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import {
  usePersistedDimensions,
  usePersistedSocketData,
} from '@/app/hooks/hooks';
import type { DimensionValue } from '@/app/features/validation/types';

export interface Socket {
  id: string;
  plateIndex: number;
  count: number;
  orientation: 'horizontal' | 'vertical';
  leftDistance: string;
  bottomDistance: string;
  anchorX?: number; // cm - position of anchor point (center of leftmost socket)
  anchorY?: number; // cm - position of anchor point (center of leftmost socket)
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
  distanceLeft: string;
  setDistanceLeft: React.Dispatch<React.SetStateAction<string>>;
  distanceBottom: string;
  setDistanceBottom: React.Dispatch<React.SetStateAction<string>>;
  sockets: Socket[];
  setSockets: React.Dispatch<React.SetStateAction<Socket[]>>;
  activeSocketId: string | null;
  setActiveSocketId: React.Dispatch<React.SetStateAction<string | null>>;
  editingSocketId: string | null;
  setEditingSocketId: React.Dispatch<React.SetStateAction<string | null>>;
}

const PlateContext = createContext<PlateContextType | undefined>(undefined);

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

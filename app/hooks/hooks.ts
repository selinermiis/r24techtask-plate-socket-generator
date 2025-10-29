/**
 * React hooks for localStorage persistence
 */

import { useState, useEffect } from 'react';
import type { DimensionValue } from '../features/validation/types';
import { INITIAL_PLATE_DIMENSION } from '../features/validation/constants';
import type { Socket } from '../types';

/**
 * localStorage hook for persisting dimensions
 */
export function usePersistedDimensions() {
  const [dimensions, setDimensionsState] = useState<DimensionValue[]>([
    INITIAL_PLATE_DIMENSION,
  ]);
  const [activeIndex, setActiveIndexState] = useState<number>(0);
  const [mounted, setMounted] = useState(false);

  // Read from localStorage on initial load
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
      console.error('localStorage read error:', e);
    }
  }, []);

  // Save to localStorage when dimensions change
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem('dimensions', JSON.stringify(dimensions));
      } catch (e) {
        console.error('localStorage write error:', e);
      }
    }
  }, [dimensions, mounted]);

  // Save to localStorage when activeIndex changes
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem('activeIndex', String(activeIndex));
      } catch (e) {
        console.error('localStorage write error:', e);
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

/**
 * localStorage hook for persisting socket data
 */
export function usePersistedSocketData() {
  const [cutoutsEnabled, setCutoutsEnabledState] = useState<boolean>(false);
  const [selectedPlateForSocket, setSelectedPlateForSocketState] = useState<
    number | null
  >(null);
  const [socketCount, setSocketCountState] = useState<number>(1);
  const [socketOrientation, setSocketOrientationState] = useState<
    'horizontal' | 'vertical'
  >('vertical');
  const [distanceLeft, setDistanceLeftState] = useState<string>('');
  const [distanceBottom, setDistanceBottomState] = useState<string>('');
  const [sockets, setSocketsState] = useState<Socket[]>([]);
  const [activeSocketId, setActiveSocketIdState] = useState<string | null>(
    null
  );
  const [editingSocketId, setEditingSocketIdState] = useState<string | null>(
    null
  );
  const [mounted, setMounted] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    setMounted(true);
    try {
      const savedCutoutsEnabled = localStorage.getItem('cutoutsEnabled');
      const savedSelectedPlate = localStorage.getItem('selectedPlateForSocket');
      const savedSocketCount = localStorage.getItem('socketCount');
      const savedSocketOrientation = localStorage.getItem('socketOrientation');
      const savedDistanceLeft = localStorage.getItem('distanceLeft');
      const savedDistanceBottom = localStorage.getItem('distanceBottom');
      const savedSockets = localStorage.getItem('sockets');
      const savedActiveSocketId = localStorage.getItem('activeSocketId');

      if (savedCutoutsEnabled !== null) {
        setCutoutsEnabledState(savedCutoutsEnabled === 'true');
      }
      if (savedSelectedPlate !== null) {
        setSelectedPlateForSocketState(
          savedSelectedPlate === 'null' ? null : parseInt(savedSelectedPlate)
        );
      }
      if (savedSocketCount !== null) {
        setSocketCountState(parseInt(savedSocketCount));
      }
      if (savedSocketOrientation !== null) {
        setSocketOrientationState(
          savedSocketOrientation as 'horizontal' | 'vertical'
        );
      }
      if (savedDistanceLeft !== null) {
        setDistanceLeftState(savedDistanceLeft);
      }
      if (savedDistanceBottom !== null) {
        setDistanceBottomState(savedDistanceBottom);
      }
      if (savedSockets) {
        setSocketsState(JSON.parse(savedSockets));
      }
      // activeSocketId is always null on initial load
      // User must explicitly select a socket
    } catch (e) {
      console.error('localStorage read error (socket):', e);
    }
  }, []);

  // Persist cutoutsEnabled
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem('cutoutsEnabled', String(cutoutsEnabled));
      } catch (e) {
        console.error('localStorage write error (cutoutsEnabled):', e);
      }
    }
  }, [cutoutsEnabled, mounted]);

  // Persist selectedPlateForSocket
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(
          'selectedPlateForSocket',
          String(selectedPlateForSocket)
        );
      } catch (e) {
        console.error('localStorage write error (selectedPlateForSocket):', e);
      }
    }
  }, [selectedPlateForSocket, mounted]);

  // Persist socketCount
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem('socketCount', String(socketCount));
      } catch (e) {
        console.error('localStorage write error (socketCount):', e);
      }
    }
  }, [socketCount, mounted]);

  // Persist socketOrientation
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem('socketOrientation', socketOrientation);
      } catch (e) {
        console.error('localStorage write error (socketOrientation):', e);
      }
    }
  }, [socketOrientation, mounted]);

  // Persist distanceLeft
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem('distanceLeft', distanceLeft);
      } catch (e) {
        console.error('localStorage write error (distanceLeft):', e);
      }
    }
  }, [distanceLeft, mounted]);

  // Persist distanceBottom
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem('distanceBottom', distanceBottom);
      } catch (e) {
        console.error('localStorage write error (distanceBottom):', e);
      }
    }
  }, [distanceBottom, mounted]);

  // Persist sockets
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem('sockets', JSON.stringify(sockets));
      } catch (e) {
        console.error('localStorage write error (sockets):', e);
      }
    }
  }, [sockets, mounted]);

  // activeSocketId is not persisted to localStorage
  // It always starts as null on page load

  return {
    cutoutsEnabled,
    setCutoutsEnabled: setCutoutsEnabledState,
    selectedPlateForSocket,
    setSelectedPlateForSocket: setSelectedPlateForSocketState,
    socketCount,
    setSocketCount: setSocketCountState,
    socketOrientation,
    setSocketOrientation: setSocketOrientationState,
    distanceLeft,
    setDistanceLeft: setDistanceLeftState,
    distanceBottom,
    setDistanceBottom: setDistanceBottomState,
    sockets,
    setSockets: setSocketsState,
    activeSocketId,
    setActiveSocketId: setActiveSocketIdState,
    editingSocketId,
    setEditingSocketId: setEditingSocketIdState,
  };
}

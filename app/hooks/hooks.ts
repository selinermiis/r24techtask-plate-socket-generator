/**
 * React hooks for localStorage persistence
 */

import { useState, useEffect } from 'react';
import type { DimensionValue } from '../features/validation/types';
import { INITIAL_PLATE_DIMENSION } from '../features/validation/constants';
import type { Socket } from '../context/PlateContext';

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

/**
 * localStorage hook for persisting socket data
 */
export function usePersistedSocketData() {
  const [cutoutsEnabled, setCutoutsEnabledState] = useState<boolean>(true);
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
      console.error('localStorage okuma hatası (socket):', e);
    }
  }, []);

  // Persist cutoutsEnabled
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem('cutoutsEnabled', String(cutoutsEnabled));
        console.log('✅ cutoutsEnabled kayıt:', cutoutsEnabled);
      } catch (e) {
        console.error('localStorage yazma hatası (cutoutsEnabled):', e);
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
        console.log('✅ selectedPlateForSocket kayıt:', selectedPlateForSocket);
      } catch (e) {
        console.error('localStorage yazma hatası (selectedPlateForSocket):', e);
      }
    }
  }, [selectedPlateForSocket, mounted]);

  // Persist socketCount
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem('socketCount', String(socketCount));
        console.log('✅ socketCount kayıt:', socketCount);
      } catch (e) {
        console.error('localStorage yazma hatası (socketCount):', e);
      }
    }
  }, [socketCount, mounted]);

  // Persist socketOrientation
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem('socketOrientation', socketOrientation);
        console.log('✅ socketOrientation kayıt:', socketOrientation);
      } catch (e) {
        console.error('localStorage yazma hatası (socketOrientation):', e);
      }
    }
  }, [socketOrientation, mounted]);

  // Persist distanceLeft
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem('distanceLeft', distanceLeft);
        console.log('✅ distanceLeft kayıt:', distanceLeft);
      } catch (e) {
        console.error('localStorage yazma hatası (distanceLeft):', e);
      }
    }
  }, [distanceLeft, mounted]);

  // Persist distanceBottom
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem('distanceBottom', distanceBottom);
        console.log('✅ distanceBottom kayıt:', distanceBottom);
      } catch (e) {
        console.error('localStorage yazma hatası (distanceBottom):', e);
      }
    }
  }, [distanceBottom, mounted]);

  // Persist sockets
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem('sockets', JSON.stringify(sockets));
        console.log('✅ sockets kayıt:', sockets);
      } catch (e) {
        console.error('localStorage yazma hatası (sockets):', e);
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

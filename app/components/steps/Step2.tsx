'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { usePlateContext } from '@/app/context/PlateContext';
import SocketToggle from '@/app/components/steps/step2/SocketToggle';
import PlateSelectionGrid from '@/app/components/steps/step2/PlateSelectionGrid';
import SocketConfiguration from '@/app/components/steps/step2/SocketConfiguration';
import PositionInputs from './step2/PositionInputs';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Socket } from '@/app/types';
import {
  validateSocketFull,
  type ValidationResult,
} from '@/app/utils/canvas/drawing';
import type { Step2Props } from '@/app/types';

export default function Step2({ onComplete }: Step2Props) {
  const {
    dimensions,
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
    editingSocketId,
    setEditingSocketId,
    activeSocketId,
    setActiveSocketId,
  } = usePlateContext();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePlateSelect = (index: number) => {
    setSelectedPlateForSocket(index);
    // Reset editing mode when selecting a plate
    setEditingSocketId(null);
    setActiveSocketId(null); // Clear active socket when plate selection changes
    setDistanceLeft('');
    setDistanceBottom('');
  };

  const handleSocketSelect = (socket: Socket) => {
    // Fill input fields with socket data
    setSelectedPlateForSocket(socket.plateIndex);
    setSocketCount(socket.count);
    setSocketOrientation(socket.orientation);

    // Use anchorX/Y if available, otherwise use leftDistance/bottomDistance
    const displayX = socket.anchorX ?? parseFloat(socket.leftDistance) ?? 0;
    const displayY = socket.anchorY ?? parseFloat(socket.bottomDistance) ?? 0;

    setDistanceLeft(displayX.toString());
    setDistanceBottom(displayY.toString());

    // Set editing mode
    setEditingSocketId(socket.id);
  };

  const handleSocketDelete = (socketId: string) => {
    setSockets(sockets.filter((socket) => socket.id !== socketId));
  };

  // Handle socket count changes
  const handleSocketCountChange = (count: number) => {
    setSocketCount(count);

    // Update active socket immediately
    const socketToUpdate = editingSocketId || activeSocketId;
    if (socketToUpdate && selectedPlateForSocket !== null) {
      const currentSocket = sockets.find((s) => s.id === socketToUpdate);
      if (currentSocket) {
        const anchorX = currentSocket.anchorX ?? parseFloat(distanceLeft) ?? 0;
        const anchorY =
          currentSocket.anchorY ?? parseFloat(distanceBottom) ?? 0;

        // Validate position with new count
        const validation = validateInputPosition(
          anchorX,
          anchorY,
          count,
          socketOrientation,
          socketToUpdate
        );

        if (validation?.isValid) {
          setErrorMessage(null);
          setSockets(
            sockets.map((socket) =>
              socket.id === socketToUpdate ? { ...socket, count } : socket
            )
          );
        } else if (validation) {
          setErrorMessage(
            validation.error || 'Invalid position with new count'
          );
        }
      }
    }
  };

  // Handle socket orientation changes
  const handleSocketOrientationChange = (
    orientation: 'horizontal' | 'vertical'
  ) => {
    setSocketOrientation(orientation);

    // Update active socket immediately
    const socketToUpdate = editingSocketId || activeSocketId;
    if (socketToUpdate && selectedPlateForSocket !== null) {
      const currentSocket = sockets.find((s) => s.id === socketToUpdate);
      if (currentSocket) {
        const anchorX = currentSocket.anchorX ?? parseFloat(distanceLeft) ?? 0;
        const anchorY =
          currentSocket.anchorY ?? parseFloat(distanceBottom) ?? 0;

        // Validate position with new orientation
        const validation = validateInputPosition(
          anchorX,
          anchorY,
          socketCount,
          orientation,
          socketToUpdate
        );

        if (validation?.isValid) {
          setErrorMessage(null);
          setSockets(
            sockets.map((socket) =>
              socket.id === socketToUpdate ? { ...socket, orientation } : socket
            )
          );
        } else if (validation) {
          setErrorMessage(
            validation.error || 'Invalid position with new orientation'
          );
        }
      }
    }
  };

  // Validate input position in real-time
  const validateInputPosition = (
    anchorX: number,
    anchorY: number,
    count?: number,
    orientation?: 'horizontal' | 'vertical',
    socketId?: string
  ): ValidationResult | null => {
    if (selectedPlateForSocket === null) return null;

    const plateDimension = dimensions[selectedPlateForSocket];
    if (!plateDimension) return null;

    const plateSockets = sockets.filter(
      (s) => s.plateIndex === selectedPlateForSocket
    );

    const testCount = count ?? socketCount;
    const testOrientation = orientation ?? socketOrientation;

    return validateSocketFull(
      anchorX,
      anchorY,
      testCount,
      testOrientation,
      parseFloat(plateDimension.width),
      parseFloat(plateDimension.height),
      plateSockets,
      socketId
    );
  };

  // Handle manual position input changes
  const handleDistanceLeftChange = (value: string) => {
    setDistanceLeft(value);

    // If a socket is selected (editing or active), update its position in real-time
    const socketToUpdate = editingSocketId || activeSocketId;
    if (socketToUpdate && selectedPlateForSocket !== null) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        // Get current anchorY
        const currentSocket = sockets.find((s) => s.id === socketToUpdate);
        const currentY =
          currentSocket?.anchorY ?? parseFloat(distanceBottom) ?? 0;

        // Validate the new position
        const validation = validateInputPosition(
          numValue,
          currentY,
          socketCount,
          socketOrientation,
          socketToUpdate
        );

        if (validation?.isValid) {
          setErrorMessage(null);
          setSockets(
            sockets.map((socket) =>
              socket.id === socketToUpdate
                ? { ...socket, anchorX: numValue }
                : socket
            )
          );
        } else if (validation) {
          setErrorMessage(validation.error || 'Invalid position');
        }
      }
    }
  };

  const handleDistanceBottomChange = (value: string) => {
    setDistanceBottom(value);

    // If a socket is selected (editing or active), update its position in real-time
    const socketToUpdate = editingSocketId || activeSocketId;
    if (socketToUpdate && selectedPlateForSocket !== null) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        // Get current anchorX
        const currentSocket = sockets.find((s) => s.id === socketToUpdate);
        const currentX =
          currentSocket?.anchorX ?? parseFloat(distanceLeft) ?? 0;

        // Validate the new position
        const validation = validateInputPosition(
          currentX,
          numValue,
          socketCount,
          socketOrientation,
          socketToUpdate
        );

        if (validation?.isValid) {
          setErrorMessage(null);
          setSockets(
            sockets.map((socket) =>
              socket.id === socketToUpdate
                ? { ...socket, anchorY: numValue }
                : socket
            )
          );
        } else if (validation) {
          setErrorMessage(validation.error || 'Invalid position');
        }
      }
    }
  };

  // Update input fields when editingSocketId changes
  useEffect(() => {
    if (editingSocketId) {
      const socket = sockets.find((s) => s.id === editingSocketId);
      if (socket) {
        setSelectedPlateForSocket(socket.plateIndex);
        setSocketCount(socket.count);
        setSocketOrientation(socket.orientation);

        // Use anchorX/Y if available, otherwise use leftDistance/bottomDistance
        const displayX = socket.anchorX ?? parseFloat(socket.leftDistance) ?? 0;
        const displayY =
          socket.anchorY ?? parseFloat(socket.bottomDistance) ?? 0;

        setDistanceLeft(displayX.toString());
        setDistanceBottom(displayY.toString());
      }
    }
  }, [editingSocketId, sockets]);

  // Update input fields when socket position changes or active socket changes
  useEffect(() => {
    if (!editingSocketId && activeSocketId) {
      const socket = sockets.find((s) => s.id === activeSocketId);
      if (socket) {
        // Update socket configuration (anzahl and ausrichtung)
        setSelectedPlateForSocket(socket.plateIndex);
        setSocketCount(socket.count);
        setSocketOrientation(socket.orientation);

        // Get the most recent anchor position
        const displayX = socket.anchorX ?? parseFloat(socket.leftDistance) ?? 0;
        const displayY =
          socket.anchorY ?? parseFloat(socket.bottomDistance) ?? 0;

        setDistanceLeft(displayX.toString());
        setDistanceBottom(displayY.toString());
      }
    }
  }, [activeSocketId, sockets, editingSocketId]);

  // Clear active socket when no plate is selected
  useEffect(() => {
    if (selectedPlateForSocket === null && activeSocketId) {
      setActiveSocketId(null);
    }
  }, [selectedPlateForSocket, activeSocketId, setActiveSocketId]);

  // Reset editing mode when component unmounts if we were editing
  useEffect(() => {
    return () => {
      if (editingSocketId) {
        setEditingSocketId(null);
        setSelectedPlateForSocket(null);
        setSocketCount(1);
        setSocketOrientation('vertical');
        setDistanceLeft('');
        setDistanceBottom('');
      }
    };
  }, []);

  // Don't show content if no dimensions
  if (dimensions.length === 0) {
    return null;
  }

  const handleConfirm = () => {
    if (selectedPlateForSocket !== null && distanceLeft && distanceBottom) {
      const anchorX = parseFloat(distanceLeft);
      const anchorY = parseFloat(distanceBottom);

      // Get plate dimensions
      const plateDimension = dimensions[selectedPlateForSocket];
      if (!plateDimension) {
        setErrorMessage('Invalid plate selection');
        return;
      }

      // Use activeSocketId if no editingSocketId (e.g., when dragged)
      const socketToUpdate = editingSocketId || activeSocketId;

      // Get all sockets on the same plate for collision checking
      const plateSockets = sockets.filter(
        (s) => s.plateIndex === selectedPlateForSocket
      );

      // Validate position
      const validation = validateSocketFull(
        anchorX,
        anchorY,
        socketCount,
        socketOrientation,
        parseFloat(plateDimension.width),
        parseFloat(plateDimension.height),
        plateSockets,
        socketToUpdate || undefined
      );

      if (!validation.isValid) {
        setErrorMessage(validation.error || 'Invalid position');
        setTimeout(() => setErrorMessage(null), 3000);
        return;
      }

      setErrorMessage(null); // Clear any previous errors

      if (socketToUpdate) {
        // Update existing socket
        setSockets(
          sockets.map((socket) =>
            socket.id === socketToUpdate
              ? {
                  ...socket,
                  plateIndex: selectedPlateForSocket,
                  count: socketCount,
                  orientation: socketOrientation,
                  leftDistance: distanceLeft,
                  bottomDistance: distanceBottom,
                  anchorX,
                  anchorY,
                }
              : socket
          )
        );
        setEditingSocketId(null);
      } else {
        // Add new socket only if no socket is selected
        const newSocket = {
          id: `socket-${Date.now()}`,
          plateIndex: selectedPlateForSocket,
          count: socketCount,
          orientation: socketOrientation,
          leftDistance: distanceLeft,
          bottomDistance: distanceBottom,
          anchorX,
          anchorY,
        };
        setSockets([...sockets, newSocket]);
      }

      // Reset inputs
      setSelectedPlateForSocket(null);
      setSocketCount(1);
      setSocketOrientation('vertical');
      setDistanceLeft('');
      setDistanceBottom('');
      setCutoutsEnabled(true); // Keep enabled after editing
    }
    onComplete();
  };

  // Format distance values to 2 decimal places for display
  const formattedDistanceLeft = useMemo(() => {
    const numValue = parseFloat(distanceLeft);
    if (isNaN(numValue) || distanceLeft === '') return distanceLeft;
    return parseFloat(numValue.toFixed(2)).toString();
  }, [distanceLeft]);

  const formattedDistanceBottom = useMemo(() => {
    const numValue = parseFloat(distanceBottom);
    if (isNaN(numValue) || distanceBottom === '') return distanceBottom;
    return parseFloat(numValue.toFixed(2)).toString();
  }, [distanceBottom]);

  return (
    <div className="space-y-3 sm:space-y-4 px-1 sm:px-0">
      {/* Toggle for cutouts */}
      <SocketToggle
        enabled={cutoutsEnabled}
        onToggle={(checked) => {
          setCutoutsEnabled(checked);
          if (!checked) {
            // Delete all socket groups when toggling OFF
            setSockets([]);
            setSelectedPlateForSocket(null);
          } else {
            // When toggling ON, add a default socket group to first eligible plate
            const eligiblePlateIndex = dimensions.findIndex((dim) => {
              const width = parseFloat(dim.width);
              const height = parseFloat(dim.height);
              return width >= 40 && height >= 40;
            });

            if (eligiblePlateIndex !== -1) {
              const defaultAnchorX = 10; // 10 cm from left
              const defaultAnchorY = 10; // 10 cm from bottom

              const newSocket = {
                id: `socket-${Date.now()}`,
                plateIndex: eligiblePlateIndex,
                count: 1,
                orientation: 'vertical' as const,
                leftDistance: defaultAnchorX.toString(),
                bottomDistance: defaultAnchorY.toString(),
                anchorX: defaultAnchorX,
                anchorY: defaultAnchorY,
              };

              setSockets([newSocket]);
              setSelectedPlateForSocket(eligiblePlateIndex);
            }
          }
        }}
      />

      {/* Panel selection - only show if cutouts are enabled */}
      {cutoutsEnabled && (
        <div className="space-y-3 sm:space-y-4">
          {/* 1) Plate selection */}
          <PlateSelectionGrid
            dimensions={dimensions}
            selectedIndex={selectedPlateForSocket}
            onSelect={handlePlateSelect}
          />

          {/* 2) Socket configuration */}
          <SocketConfiguration
            socketCount={socketCount}
            onSocketCountChange={handleSocketCountChange}
            socketOrientation={socketOrientation}
            onOrientationChange={handleSocketOrientationChange}
            disabled={selectedPlateForSocket === null}
          />
          {/* 3) Position inputs */}
          <PositionInputs
            distanceLeft={formattedDistanceLeft}
            distanceBottom={formattedDistanceBottom}
            onDistanceLeftChange={handleDistanceLeftChange}
            onDistanceBottomChange={handleDistanceBottomChange}
            disabled={selectedPlateForSocket === null}
          />
          {/* Error message */}
          {errorMessage && (
            <div className="text-red-700 text-sm" role="alert">
              <span className="block">{errorMessage}</span>
            </div>
          )}

          {/* 4) Confirm button */}
          <Button
            onClick={handleConfirm}
            disabled={selectedPlateForSocket === null}
            className={cn(
              'w-full flex justify-center items-center',
              selectedPlateForSocket === null
                ? 'opacity-50 pointer-events-none'
                : 'text-green-800 border-green-400 hover:bg-green-100 hover:text-green-800'
            )}
            variant="outline"
          >
            {editingSocketId || activeSocketId
              ? 'Steckdose aktualisieren'
              : 'Steckdose bestätigen'}
          </Button>
        </div>
      )}
    </div>
  );
}

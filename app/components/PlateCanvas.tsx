'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { usePlateContext } from '@/app/context/PlateContext';
import { calculatePlateScaling } from '@/app/utils/canvas/scaling';
import {
  drawAllPlates,
  setupHighDPICanvas,
  drawSocket,
  drawHelperLines,
  calculateSocketPositions,
  validateSocketFull,
  type DrawingOptions,
  type SocketScaled,
} from '@/app/utils/canvas/drawing';

export default function PlateCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    dimensions,
    activeIndex,
    setActiveIndex,
    selectedPlateForSocket,
    sockets,
    setSockets,
    activeSocketId,
    setActiveSocketId,
    editingSocketId,
    setEditingSocketId,
    setDistanceLeft,
    setDistanceBottom,
    cutoutsEnabled,
  } = usePlateContext();
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [draggingSocketId, setDraggingSocketId] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragErrorMessage, setDragErrorMessage] = useState<string | null>(null);
  const [dragStartPosition, setDragStartPosition] = useState<{
    anchorX: number;
    anchorY: number;
  } | null>(null);

  // Filter dimensions to show only selected plate if in Step 2
  const displayDimensions = React.useMemo(() => {
    if (selectedPlateForSocket !== null && dimensions[selectedPlateForSocket]) {
      // Show only the selected plate
      return [dimensions[selectedPlateForSocket]];
    }
    return dimensions;
  }, [dimensions, selectedPlateForSocket]);

  // Filter sockets to only show those on the displayed plates
  const displaySockets = React.useMemo(() => {
    if (selectedPlateForSocket !== null) {
      return sockets.filter(
        (socket) => socket.plateIndex === selectedPlateForSocket
      );
    }
    return sockets;
  }, [sockets, selectedPlateForSocket]);

  // Clear active socket when no plate is selected
  useEffect(() => {
    if (selectedPlateForSocket === null && activeSocketId) {
      setActiveSocketId(null);
    }
  }, [selectedPlateForSocket, activeSocketId, setActiveSocketId]);

  /**
   * Render plates and sockets on canvas
   */
  const renderPlates = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvasSize.width === 0 || canvasSize.height === 0) {
      return;
    }

    // Setup high DPI canvas
    const ctx = setupHighDPICanvas(canvas, canvasSize.width, canvasSize.height);
    if (!ctx) return;

    // Check if dimensions exist
    if (displayDimensions.length === 0) {
      // No dimensions to render
      return;
    }

    // Calculate scaling and positions
    const scalingResult = calculatePlateScaling(
      displayDimensions,
      canvasSize.width,
      canvasSize.height
    );

    // Drawing options
    const options: DrawingOptions = {
      backgroundColor: '#000000',
      plateColor: '#FFFFFF',
    };

    // Draw all plates
    drawAllPlates(
      ctx,
      scalingResult.plates,
      canvasSize.width,
      canvasSize.height,
      options
    );

    // Draw sockets - only if cutouts are enabled
    if (
      cutoutsEnabled &&
      displaySockets.length > 0 &&
      scalingResult.plates.length > 0
    ) {
      displaySockets.forEach((socket) => {
        // In Step 2 (selectedPlateForSocket !== null), there's only one plate
        // and it's the first one in scalingResult.plates (index 0)
        const plate =
          selectedPlateForSocket !== null
            ? scalingResult.plates[0] // Only one plate in Step 2 mode
            : scalingResult.plates.find((p) => p.index === socket.plateIndex); // Find by index in other modes

        // Skip if plate not found
        if (!plate) return;

        // Get socket anchor position (default to center if not set)
        const anchorX =
          socket.anchorX ??
          parseFloat(socket.leftDistance) ??
          plate.originalWidth / 2;
        const anchorY =
          socket.anchorY ??
          parseFloat(socket.bottomDistance) ??
          plate.originalHeight / 2;

        // Calculate socket positions using the plate's scale and position
        const socketScaled = calculateSocketPositions(
          anchorX,
          anchorY,
          socket.count,
          socket.orientation,
          scalingResult.scale,
          plate.x,
          plate.y,
          plate.width,
          plate.height
        );

        // Draw sockets first
        socketScaled.forEach((singleSocket, idx) => {
          const isActive = socket.id === activeSocketId;
          drawSocket(ctx, singleSocket, scalingResult.scale, isActive);

          // Draw separator line between sockets (except for the last one)
          if (idx < socketScaled.length - 1) {
            const gapPx = 0.5 * scalingResult.scale; // 0.5cm gap in pixels

            if (socket.orientation === 'horizontal') {
              // Vertical separator line
              const separatorX =
                singleSocket.x + singleSocket.width + gapPx / 2;
              ctx.strokeStyle = '#D1D5DB'; // Light gray
              ctx.lineWidth = 1;
              ctx.setLineDash([2, 2]); // Dashed line
              ctx.beginPath();
              ctx.moveTo(separatorX, singleSocket.y);
              ctx.lineTo(separatorX, singleSocket.y + singleSocket.height);
              ctx.stroke();
              ctx.setLineDash([]); // Reset line dash
            } else {
              // Horizontal separator line
              const separatorY =
                singleSocket.y + singleSocket.height + gapPx / 2;
              ctx.strokeStyle = '#D1D5DB'; // Light gray
              ctx.lineWidth = 1;
              ctx.setLineDash([2, 2]); // Dashed line
              ctx.beginPath();
              ctx.moveTo(singleSocket.x, separatorY);
              ctx.lineTo(singleSocket.x + singleSocket.width, separatorY);
              ctx.stroke();
              ctx.setLineDash([]); // Reset line dash
            }
          }
        });

        // Draw helper lines after sockets (so they appear on top)
        // Only for the first socket of the active/dragging socket group
        if (
          socketScaled.length > 0 &&
          (socket.id === activeSocketId || socket.id === draggingSocketId)
        ) {
          const firstSocket = socketScaled[0];
          if (
            firstSocket.anchorXPx !== undefined &&
            firstSocket.anchorYPx !== undefined &&
            firstSocket.anchorX !== undefined &&
            firstSocket.anchorY !== undefined
          ) {
            drawHelperLines(
              ctx,
              firstSocket.anchorXPx,
              firstSocket.anchorYPx,
              firstSocket.anchorX,
              firstSocket.anchorY,
              plate.x,
              plate.y,
              plate.width,
              plate.height
            );
          }
        }
      });
    }
  }, [
    canvasSize,
    displayDimensions,
    displaySockets,
    activeSocketId,
    sockets,
    cutoutsEnabled,
    draggingSocketId,
  ]);

  /**
   * Calculate plate positions for HTML overlay
   */
  const platePositions = React.useMemo(() => {
    if (canvasSize.width === 0 || canvasSize.height === 0) return [];

    const scalingResult = calculatePlateScaling(
      displayDimensions,
      canvasSize.width,
      canvasSize.height
    );

    return scalingResult.plates;
  }, [displayDimensions, canvasSize]);

  /**
   * Get scaling result for coordinate conversion
   */
  const scalingResult = React.useMemo(() => {
    if (canvasSize.width === 0 || canvasSize.height === 0) return null;
    return calculatePlateScaling(
      displayDimensions,
      canvasSize.width,
      canvasSize.height
    );
  }, [displayDimensions, canvasSize]);

  /**
   * Handle canvas click and touch interactions
   */
  const handleInteraction = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas || !scalingResult) return;

      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      // Check if clicking on a socket - only if cutouts are enabled
      if (cutoutsEnabled) {
        for (const socket of displaySockets) {
          // Find the plate that this socket belongs to
          const plate =
            selectedPlateForSocket !== null
              ? scalingResult.plates[0]
              : scalingResult.plates.find((p) => p.index === socket.plateIndex);
          if (!plate) continue;

          const anchorX =
            socket.anchorX ??
            parseFloat(socket.leftDistance) ??
            plate.originalWidth / 2;
          const anchorY =
            socket.anchorY ??
            parseFloat(socket.bottomDistance) ??
            plate.originalHeight / 2;

          const socketScaled = calculateSocketPositions(
            anchorX,
            anchorY,
            socket.count,
            socket.orientation,
            scalingResult.scale,
            plate.x,
            plate.y,
            plate.width,
            plate.height
          );

          // Check if clicked on any socket in the group
          for (const singleSocket of socketScaled) {
            if (
              x >= singleSocket.x &&
              x <= singleSocket.x + singleSocket.width &&
              y >= singleSocket.y &&
              y <= singleSocket.y + singleSocket.height
            ) {
              setActiveSocketId(socket.id);
              return;
            }
          }
        }
      }

      // Check which plate was clicked/touched
      let plateClicked = false;
      for (let i = 0; i < platePositions.length; i++) {
        const plate = platePositions[i];
        if (
          x >= plate.x &&
          x <= plate.x + plate.width &&
          y >= plate.y &&
          y <= plate.y + plate.height
        ) {
          setActiveIndex(plate.index);
          // Clear socket selection when clicking on plate (but not on socket)
          setActiveSocketId(null);
          plateClicked = true;
          return;
        }
      }

      // If clicked outside plates (empty canvas area), clear socket selection
      if (!plateClicked && cutoutsEnabled) {
        setActiveSocketId(null);
      }
    },
    [
      platePositions,
      setActiveIndex,
      displaySockets,
      scalingResult,
      setActiveSocketId,
      cutoutsEnabled,
      selectedPlateForSocket,
    ]
  );

  /**
   * Handle mouse down events
   */
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || !scalingResult || !cutoutsEnabled) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Check if clicking on a socket to start dragging
      for (const socket of displaySockets) {
        // Find the plate that this socket belongs to
        const plate =
          selectedPlateForSocket !== null
            ? scalingResult.plates[0]
            : scalingResult.plates.find((p) => p.index === socket.plateIndex);
        if (!plate) continue;

        const anchorX =
          socket.anchorX ??
          parseFloat(socket.leftDistance) ??
          plate.originalWidth / 2;
        const anchorY =
          socket.anchorY ??
          parseFloat(socket.bottomDistance) ??
          plate.originalHeight / 2;

        const socketScaled = calculateSocketPositions(
          anchorX,
          anchorY,
          socket.count,
          socket.orientation,
          scalingResult.scale,
          plate.x,
          plate.y,
          plate.width,
          plate.height
        );

        // Check if clicked on any socket in the group
        for (const singleSocket of socketScaled) {
          if (
            x >= singleSocket.x &&
            x <= singleSocket.x + singleSocket.width &&
            y >= singleSocket.y &&
            y <= singleSocket.y + singleSocket.height
          ) {
            setDraggingSocketId(socket.id);
            setActiveSocketId(socket.id);
            // Clear editing mode when starting drag to allow input updates
            setEditingSocketId(null);
            setDragStart({ x, y });
            // Save initial position for snap back
            const currentAnchorX =
              socket.anchorX ?? parseFloat(socket.leftDistance) ?? 0;
            const currentAnchorY =
              socket.anchorY ?? parseFloat(socket.bottomDistance) ?? 0;
            setDragStartPosition({
              anchorX: currentAnchorX,
              anchorY: currentAnchorY,
            });
            setDragErrorMessage(null);
            e.preventDefault();
            return;
          }
        }
      }
    },
    [
      displaySockets,
      scalingResult,
      setActiveSocketId,
      setEditingSocketId,
      cutoutsEnabled,
      selectedPlateForSocket,
    ]
  );

  /**
   * Handle mouse move events (dragging)
   */
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!draggingSocketId || !scalingResult) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Find the socket being dragged
      const socket = displaySockets.find((s) => s.id === draggingSocketId);
      if (!socket) return;

      // Find the plate that this socket belongs to
      const plate =
        selectedPlateForSocket !== null
          ? scalingResult.plates[0]
          : scalingResult.plates.find((p) => p.index === socket.plateIndex);
      if (!plate) return;

      // Calculate delta in cm
      const deltaXPx = x - dragStart.x;
      const deltaYPx = y - dragStart.y;
      const deltaXCm = deltaXPx / scalingResult.scale;
      const deltaYCm = -deltaYPx / scalingResult.scale; // Flip Y axis

      // Get current anchor position
      const currentAnchorX =
        socket.anchorX ??
        parseFloat(socket.leftDistance) ??
        plate.originalWidth / 2;
      const currentAnchorY =
        socket.anchorY ??
        parseFloat(socket.bottomDistance) ??
        plate.originalHeight / 2;

      // Calculate new anchor position
      const newAnchorX = currentAnchorX + deltaXCm;
      const newAnchorY = currentAnchorY + deltaYCm;

      // Get all sockets on the same plate for collision checking
      const plateSockets = sockets.filter(
        (s) => s.plateIndex === socket.plateIndex
      );

      // Validate position with full validation including collisions
      const validation = validateSocketFull(
        newAnchorX,
        newAnchorY,
        socket.count,
        socket.orientation,
        plate.originalWidth,
        plate.originalHeight,
        plateSockets,
        draggingSocketId // Exclude the socket being dragged
      );

      if (validation.isValid) {
        // Update socket position - update the full sockets array, not just displaySockets
        setSockets((prevSockets) =>
          prevSockets.map((s) =>
            s.id === draggingSocketId
              ? { ...s, anchorX: newAnchorX, anchorY: newAnchorY }
              : s
          )
        );

        // Always update input fields when dragging any socket
        setDistanceLeft(newAnchorX.toString());
        setDistanceBottom(newAnchorY.toString());

        setDragStart({ x, y });
        setDragErrorMessage(null); // Clear error if position becomes valid
      } else {
        // Block drag and show error message
        setDragErrorMessage(validation.error || 'Invalid position');
      }
    },
    [
      draggingSocketId,
      scalingResult,
      displaySockets,
      dragStart,
      setSockets,
      editingSocketId,
      setDistanceLeft,
      setDistanceBottom,
      selectedPlateForSocket,
    ]
  );

  /**
   * Handle mouse up events (stop dragging)
   */
  const handleMouseUp = useCallback(() => {
    // If there's an error at the end of drag, snap back to original position
    if (dragErrorMessage && dragStartPosition && draggingSocketId) {
      setSockets((prevSockets) =>
        prevSockets.map((s) =>
          s.id === draggingSocketId
            ? {
                ...s,
                anchorX: dragStartPosition.anchorX,
                anchorY: dragStartPosition.anchorY,
              }
            : s
        )
      );
      setDistanceLeft(dragStartPosition.anchorX.toString());
      setDistanceBottom(dragStartPosition.anchorY.toString());
    }

    setDraggingSocketId(null);
    setDragStartPosition(null);
    // Clear error after a delay to show it was blocked
    if (dragErrorMessage) {
      setTimeout(() => setDragErrorMessage(null), 3000);
    }
  }, [
    dragErrorMessage,
    dragStartPosition,
    draggingSocketId,
    setSockets,
    setDistanceLeft,
    setDistanceBottom,
  ]);

  /**
   * Handle click events
   */
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      handleInteraction(e.clientX, e.clientY);
    },
    [handleInteraction]
  );

  /**
   * Handle touch start events
   */
  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || !scalingResult || !cutoutsEnabled) return;

      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        // Check if touching a socket to start dragging
        for (const socket of displaySockets) {
          // Find the plate that this socket belongs to
          const plate =
            selectedPlateForSocket !== null
              ? scalingResult.plates[0]
              : scalingResult.plates.find((p) => p.index === socket.plateIndex);
          if (!plate) continue;

          const anchorX =
            socket.anchorX ??
            parseFloat(socket.leftDistance) ??
            plate.originalWidth / 2;
          const anchorY =
            socket.anchorY ??
            parseFloat(socket.bottomDistance) ??
            plate.originalHeight / 2;

          const socketScaled = calculateSocketPositions(
            anchorX,
            anchorY,
            socket.count,
            socket.orientation,
            scalingResult.scale,
            plate.x,
            plate.y,
            plate.width,
            plate.height
          );

          // Check if touching any socket in the group
          for (const singleSocket of socketScaled) {
            if (
              x >= singleSocket.x &&
              x <= singleSocket.x + singleSocket.width &&
              y >= singleSocket.y &&
              y <= singleSocket.y + singleSocket.height
            ) {
              setDraggingSocketId(socket.id);
              setActiveSocketId(socket.id);
              // Clear editing mode when starting drag to allow input updates
              setEditingSocketId(null);
              setDragStart({ x, y });
              // Save initial position for snap back
              const currentAnchorX =
                socket.anchorX ?? parseFloat(socket.leftDistance) ?? 0;
              const currentAnchorY =
                socket.anchorY ?? parseFloat(socket.bottomDistance) ?? 0;
              setDragStartPosition({
                anchorX: currentAnchorX,
                anchorY: currentAnchorY,
              });
              setDragErrorMessage(null);
              e.preventDefault();
              return;
            }
          }
        }
      }
    },
    [
      displaySockets,
      scalingResult,
      setActiveSocketId,
      setEditingSocketId,
      cutoutsEnabled,
      selectedPlateForSocket,
    ]
  );

  /**
   * Handle touch move events (dragging)
   */
  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      if (!draggingSocketId || !scalingResult) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        // Find the socket being dragged
        const socket = displaySockets.find((s) => s.id === draggingSocketId);
        if (!socket) return;

        // Find the plate that this socket belongs to
        const plate =
          selectedPlateForSocket !== null
            ? scalingResult.plates[0]
            : scalingResult.plates.find((p) => p.index === socket.plateIndex);
        if (!plate) return;

        // Calculate delta in cm
        const deltaXPx = x - dragStart.x;
        const deltaYPx = y - dragStart.y;
        const deltaXCm = deltaXPx / scalingResult.scale;
        const deltaYCm = -deltaYPx / scalingResult.scale; // Flip Y axis

        // Get current anchor position
        const currentAnchorX =
          socket.anchorX ??
          parseFloat(socket.leftDistance) ??
          plate.originalWidth / 2;
        const currentAnchorY =
          socket.anchorY ??
          parseFloat(socket.bottomDistance) ??
          plate.originalHeight / 2;

        // Calculate new anchor position
        const newAnchorX = currentAnchorX + deltaXCm;
        const newAnchorY = currentAnchorY + deltaYCm;

        // Get all sockets on the same plate for collision checking
        const plateSockets = sockets.filter(
          (s) => s.plateIndex === socket.plateIndex
        );

        // Validate position with full validation including collisions
        const validation = validateSocketFull(
          newAnchorX,
          newAnchorY,
          socket.count,
          socket.orientation,
          plate.originalWidth,
          plate.originalHeight,
          plateSockets,
          draggingSocketId // Exclude the socket being dragged
        );

        if (validation.isValid) {
          // Update socket position - update the full sockets array, not just displaySockets
          setSockets((prevSockets) =>
            prevSockets.map((s) =>
              s.id === draggingSocketId
                ? { ...s, anchorX: newAnchorX, anchorY: newAnchorY }
                : s
            )
          );

          // Always update input fields when dragging any socket
          setDistanceLeft(newAnchorX.toString());
          setDistanceBottom(newAnchorY.toString());

          setDragStart({ x, y });
          setDragErrorMessage(null); // Clear error if position becomes valid
        } else {
          // Block drag and show error message
          setDragErrorMessage(validation.error || 'Invalid position');
        }

        e.preventDefault();
      }
    },
    [
      draggingSocketId,
      scalingResult,
      displaySockets,
      dragStart,
      setSockets,
      editingSocketId,
      setDistanceLeft,
      setDistanceBottom,
      selectedPlateForSocket,
    ]
  );

  /**
   * Handle touch end events
   */
  const handleTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      // If there's an error at the end of drag, snap back to original position
      if (dragErrorMessage && dragStartPosition && draggingSocketId) {
        setSockets((prevSockets) =>
          prevSockets.map((s) =>
            s.id === draggingSocketId
              ? {
                  ...s,
                  anchorX: dragStartPosition.anchorX,
                  anchorY: dragStartPosition.anchorY,
                }
              : s
          )
        );
        setDistanceLeft(dragStartPosition.anchorX.toString());
        setDistanceBottom(dragStartPosition.anchorY.toString());
      }

      setDraggingSocketId(null);
      setDragStartPosition(null);
      // Clear error after a delay to show it was blocked
      if (dragErrorMessage) {
        setTimeout(() => setDragErrorMessage(null), 3000);
      }

      // Handle tap (not drag) for socket selection
      if (e.changedTouches.length > 0 && !draggingSocketId) {
        const touch = e.changedTouches[0];
        handleInteraction(touch.clientX, touch.clientY);
      }
    },
    [
      handleInteraction,
      dragErrorMessage,
      dragStartPosition,
      draggingSocketId,
      setSockets,
      setDistanceLeft,
      setDistanceBottom,
    ]
  );

  /**
   * Update canvas size based on container
   */
  const updateCanvasSize = useCallback(() => {
    if (!containerRef.current) return;

    const { width, height } = containerRef.current.getBoundingClientRect();
    setCanvasSize({ width, height });
  }, []);

  /**
   * Handle window resize with debounce
   */
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        updateCanvasSize();
      }, 100); // Debounce 100ms
    };

    // Initial size
    updateCanvasSize();

    // Setup resize observer for container
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Fallback to window resize event
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [updateCanvasSize]);

  /**
   * Re-render when dimensions, canvas size, or sockets change
   */
  useEffect(() => {
    renderPlates();
  }, [renderPlates]);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={draggingSocketId ? 'cursor-grabbing' : 'cursor-pointer'}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          touchAction: 'none',
          position: 'absolute',
          inset: 0,
        }}
      />

      {/* HTML Overlay for plate borders and labels */}
      <div className="pointer-events-none absolute inset-0">
        {platePositions.map((plate) => {
          const isActive = plate.index === activeIndex;
          return (
            <React.Fragment key={plate.index}>
              {/* Plate border */}
              <div
                className="absolute transition-all duration-200 "
                style={{
                  left: `${plate.x}px`,
                  top: `${plate.y}px`,
                  width: `${plate.width}px`,
                  height: `${plate.height}px`,
                  border: isActive
                    ? '2px solid #3b82f6'
                    : '2px solid transparent',
                }}
              />
              {/* Plate label */}
              <div
                className="absolute transition-all duration-200"
                style={{
                  left: `${plate.x}px`,
                  top: `${plate.y + plate.height + 8}px`,
                  width: `${plate.width}px`,
                }}
              >
                <div className="flex flex-col items-center justify-center">
                  <p className="text-sm font-medium transition-colors duration-200 text-white">
                    {plate.originalWidth} x {plate.originalHeight} cm
                  </p>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Error message overlay */}
      {dragErrorMessage && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
          <div className="bg-red-500 text-white p-2 rounded-lg shadow-lg animate-fade-in">
            <p className="text-sm font-semibold">{dragErrorMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}

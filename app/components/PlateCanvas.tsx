'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { usePlateContext } from '@/app/context/PlateContext';
import { calculatePlateScaling } from '@/app/utils/canvas/scaling';
import {
  drawAllPlates,
  setupHighDPICanvas,
  type DrawingOptions,
} from '@/app/utils/canvas/drawing';

export default function PlateCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { dimensions, activeIndex, setActiveIndex, selectedPlateForSocket } =
    usePlateContext();
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Filter dimensions to show only selected plate if in Step 2
  const displayDimensions = React.useMemo(() => {
    if (selectedPlateForSocket !== null) {
      // Show only the selected plate
      return [dimensions[selectedPlateForSocket]].filter(Boolean);
    }
    return dimensions;
  }, [dimensions, selectedPlateForSocket]);

  /**
   * Render plates on canvas
   */
  const renderPlates = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvasSize.width === 0 || canvasSize.height === 0) {
      console.log('❌ Canvas not ready:', { canvas: !!canvas, canvasSize });
      return;
    }

    // Setup high DPI canvas
    const ctx = setupHighDPICanvas(canvas, canvasSize.width, canvasSize.height);
    if (!ctx) return;

    // Calculate scaling and positions
    const scalingResult = calculatePlateScaling(
      displayDimensions,
      canvasSize.width,
      canvasSize.height
    );

    // Drawing options - disable canvas text rendering
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
  }, [canvasSize, displayDimensions]);

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
   * Handle canvas click and touch interactions
   */
  const handleInteraction = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      // Check which plate was clicked/touched
      for (let i = 0; i < platePositions.length; i++) {
        const plate = platePositions[i];
        if (
          x >= plate.x &&
          x <= plate.x + plate.width &&
          y >= plate.y &&
          y <= plate.y + plate.height
        ) {
          setActiveIndex(plate.index);
          return;
        }
      }
    },
    [platePositions, setActiveIndex]
  );

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
   * Handle touch events
   */
  const handleTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      if (e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        handleInteraction(touch.clientX, touch.clientY);
      }
    },
    [handleInteraction]
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
   * Re-render when dimensions or canvas size changes
   */
  useEffect(() => {
    renderPlates();
  }, [renderPlates]);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        onTouchEnd={handleTouchEnd}
        className="cursor-pointer absolute inset-0 touch-none"
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          touchAction: 'manipulation',
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
    </div>
  );
}

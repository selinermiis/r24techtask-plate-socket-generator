/**
 * Canvas scaling utilities for plate rendering
 * All dimensions are in centimeters (cm) internally, converted to pixels for rendering
 */

import type { DimensionValue } from '@/app/features/validation/types';

export interface PlateScaled {
  width: number; // pixels
  height: number; // pixels
  x: number; // pixels (horizontal position)
  y: number; // pixels (vertical position)
  originalWidth: number; // cm
  originalHeight: number; // cm
  index: number;
}

export interface ScalingResult {
  plates: PlateScaled[];
  scale: number; // pixels per cm
  totalWidth: number; // pixels
  maxHeight: number; // pixels
}

const PADDING = 40; // pixels - padding from canvas edges
const PLATE_GAP = 20; // pixels - gap between plates

/**
 * Calculate scaling and positions for all plates to fit in canvas
 */
export function calculatePlateScaling(
  dimensions: DimensionValue[],
  canvasWidth: number,
  canvasHeight: number
): ScalingResult {
  // Parse dimensions to numbers (cm)
  const plates = dimensions.map((dim, index) => ({
    width: parseFloat(dim.width) || 0,
    height: parseFloat(dim.height) || 0,
    index,
  }));

  // Calculate total width (cm) including gaps
  const totalWidthCm = plates.reduce((sum, plate) => sum + plate.width, 0);
  const maxHeightCm = Math.max(...plates.map((p) => p.height));

  // Available space (pixels)
  const availableWidth =
    canvasWidth - PADDING * 2 - PLATE_GAP * (plates.length - 1);
  const availableHeight = canvasHeight - PADDING * 2;

  // Calculate scale factor (pixels per cm)
  // Choose the smaller scale to ensure everything fits
  const scaleX = availableWidth / totalWidthCm;
  const scaleY = availableHeight / maxHeightCm;
  const scale = Math.min(scaleX, scaleY);

  // Calculate positions and scaled dimensions
  let currentX = PADDING;
  const scaledPlates: PlateScaled[] = plates.map((plate) => {
    const scaledWidth = plate.width * scale;
    const scaledHeight = plate.height * scale;

    // Center vertically
    const y = PADDING + (availableHeight - scaledHeight) / 2;

    const result: PlateScaled = {
      width: scaledWidth,
      height: scaledHeight,
      x: currentX,
      y: y,
      originalWidth: plate.width,
      originalHeight: plate.height,
      index: plate.index,
    };

    // Move to next position
    currentX += scaledWidth + PLATE_GAP;

    return result;
  });

  return {
    plates: scaledPlates,
    scale,
    totalWidth: currentX - PLATE_GAP - PADDING,
    maxHeight: maxHeightCm * scale,
  };
}

/**
 * Convert centimeters to pixels using scale factor
 */
export function cmToPixels(cm: number, scale: number): number {
  return cm * scale;
}

/**
 * Convert pixels to centimeters using scale factor
 */
export function pixelsToCm(pixels: number, scale: number): number {
  return pixels / scale;
}

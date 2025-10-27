/**
 * Canvas drawing utilities for rendering plates
 */

import type { PlateScaled } from './scaling';

export interface DrawingOptions {
  backgroundColor?: string;
  plateColor?: string;
  plateBorderColor?: string;
  activePlateColor?: string;
  activePlateBorderColor?: string;
  activeIndex?: number;
}

const DEFAULT_OPTIONS: Required<DrawingOptions> = {
  backgroundColor: '#000000',
  plateColor: '#FFFFFF',
  plateBorderColor: '#E5E7EB',
  activePlateColor: '#F3F4F6',
  activePlateBorderColor: '#3B82F6',
  activeIndex: -1,
};

/**
 * Clear canvas
 */
export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  backgroundColor: string = DEFAULT_OPTIONS.backgroundColor
) {
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);
}

/**
 * Draw a single plate
 */
export function drawPlate(
  ctx: CanvasRenderingContext2D,
  plate: PlateScaled,
  options: DrawingOptions = {}
) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const isActive = plate.index === opts.activeIndex;

  // Choose colors based on active state
  const fillColor = isActive ? opts.activePlateColor : opts.plateColor;
  const strokeColor = isActive
    ? opts.activePlateBorderColor
    : opts.plateBorderColor;

  // Draw plate rectangle
  ctx.fillStyle = fillColor;
  ctx.fillRect(plate.x, plate.y, plate.width, plate.height);

  // Draw border
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = isActive ? 3 : 2;
  ctx.strokeRect(plate.x, plate.y, plate.width, plate.height);
}

/**
 * Draw dimensions text on plate
 */
function drawPlateDimensions(
  ctx: CanvasRenderingContext2D,
  plate: PlateScaled,
  isActive: boolean
) {
  const text = `${plate.originalWidth} × ${plate.originalHeight} cm`;
  const fontSize = Math.max(12, Math.min(16, plate.height / 8));

  ctx.font = `${isActive ? 'bold' : 'normal'} ${fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Text color - black for better contrast
  ctx.fillStyle = isActive ? '#1F2937' : '#4B5563';

  // Draw text in center of plate
  ctx.fillText(text, plate.x + plate.width / 2, plate.y + plate.height / 2);

  // Draw plate number
  const numberText = `#${plate.index + 1}`;
  const numberFontSize = Math.max(10, Math.min(14, plate.height / 10));
  ctx.font = `bold ${numberFontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif`;
  ctx.fillStyle = isActive ? '#3B82F6' : '#6B7280';
  ctx.fillText(numberText, plate.x + plate.width / 2, plate.y + 20);
}

/**
 * Draw all plates on canvas
 */
export function drawAllPlates(
  ctx: CanvasRenderingContext2D,
  plates: PlateScaled[],
  canvasWidth: number,
  canvasHeight: number,
  options: DrawingOptions = {}
) {
  // Clear canvas first
  clearCanvas(ctx, canvasWidth, canvasHeight, options.backgroundColor);

  // Draw each plate
  plates.forEach((plate) => {
    drawPlate(ctx, plate, options);
  });
}

/**
 * Enable high DPI canvas rendering
 */
export function setupHighDPICanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number
): CanvasRenderingContext2D | null {
  const dpr = window.devicePixelRatio || 1;

  // Set display size (css pixels)
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  // Set actual size in memory (scaled to account for extra pixel density)
  canvas.width = width * dpr;
  canvas.height = height * dpr;

  // Get context and scale
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Scale all drawing operations by the dpr
  ctx.scale(dpr, dpr);

  return ctx;
}

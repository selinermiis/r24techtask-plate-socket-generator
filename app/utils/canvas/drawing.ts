/**
 * Canvas drawing utilities for rendering plates and sockets
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

export interface SocketScaled {
  x: number; // pixels
  y: number; // pixels
  width: number; // pixels
  height: number; // pixels
  anchorX: number; // cm
  anchorY: number; // cm
  anchorXPx: number; // pixels - anchor x position on canvas
  anchorYPx: number; // pixels - anchor y position on canvas
  socketIndex: number;
  groupId: string;
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

// Socket dimensions (in cm)
const SOCKET_SIZE = 7; // 7cm x 7cm
const SOCKET_GAP = 0.2; // 0.2cm gap between sockets
const MIN_DISTANCE_FROM_EDGE = 3; // 3cm from plate edges (so socket center is 6.5cm from border = 3cm + 3.5cm)
const MIN_DISTANCE_BETWEEN_GROUPS = 4; // 4cm between socket groups

/**
 * Draw helper lines from anchor point to plate edges with distance labels
 */
export function drawHelperLines(
  ctx: CanvasRenderingContext2D,
  anchorXPx: number, // pixels - anchor x position
  anchorYPx: number, // pixels - anchor y position
  anchorX: number, // cm - anchor x position
  anchorY: number, // cm - anchor y position
  plateX: number, // pixels - plate left edge
  plateY: number, // pixels - plate top edge
  plateWidth: number, // pixels
  plateHeight: number // pixels
) {
  // Set up dashed line style
  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = '#EF4444'; // Red color
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.8;

  // Draw horizontal line to left edge (anchor y to left edge)
  ctx.beginPath();
  ctx.moveTo(plateX, anchorYPx);
  ctx.lineTo(anchorXPx, anchorYPx);
  ctx.stroke();

  // Draw vertical line to bottom edge (anchor x to bottom edge)
  const plateBottomY = plateY + plateHeight;
  ctx.beginPath();
  ctx.moveTo(anchorXPx, anchorYPx);
  ctx.lineTo(anchorXPx, plateBottomY);
  ctx.stroke();

  // Draw anchor point as red dot
  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.arc(anchorXPx, anchorYPx, 4, 0, Math.PI * 2);
  ctx.fill();

  // Reset line style
  ctx.setLineDash([]);
  ctx.globalAlpha = 1.0;

  // Draw distance labels
  ctx.fillStyle = '#EF4444';
  ctx.font =
    'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Horizontal distance label (left side, middle of line)
  const horizontalMidX = plateX + (anchorXPx - plateX) / 2;
  ctx.fillText(`${anchorX.toFixed(1)} cm`, horizontalMidX, anchorYPx - 10);

  // Vertical distance label (bottom side, middle of line)
  const verticalMidY = anchorYPx + (plateBottomY - anchorYPx) / 2;
  ctx.fillText(`${anchorY.toFixed(1)} cm`, anchorXPx + 15, verticalMidY);
}

/**
 * Draw a single socket at the given position and scale
 */
export function drawSocket(
  ctx: CanvasRenderingContext2D,
  socket: SocketScaled,
  scale: number,
  isActive: boolean = false
) {
  // Draw socket rectangle
  ctx.fillStyle = '#F3F4F6'; // Light gray background
  ctx.fillRect(socket.x, socket.y, socket.width, socket.height);

  // Draw socket border
  ctx.strokeStyle = isActive ? '#3B82F6' : '#E5E7EB';
  ctx.lineWidth = isActive ? 2 : 1;
  ctx.strokeRect(socket.x, socket.y, socket.width, socket.height);

  // Draw two holes for the socket (circular openings)
  const holeRadius = Math.min(socket.width, socket.height) * 0.1; // 15% of size
  const holeSpacing = Math.min(socket.width, socket.height) * 0.2; // spacing between holes
  const centerX = socket.x + socket.width / 2;
  const centerY = socket.y + socket.height / 2;

  // Left hole
  ctx.fillStyle = '#1F2937'; // Dark background
  ctx.beginPath();
  ctx.arc(centerX - holeSpacing, centerY, holeRadius, 0, Math.PI * 2);
  ctx.fill();

  // Right hole
  ctx.beginPath();
  ctx.arc(centerX + holeSpacing, centerY, holeRadius, 0, Math.PI * 2);
  ctx.fill();

  // Draw ground pin hole (bottom center)
  ctx.beginPath();
  ctx.arc(
    centerX,
    centerY + holeSpacing * 1.2,
    holeRadius * 0.6,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

/**
 * Calculate socket positions for a socket group
 */
export function calculateSocketPositions(
  anchorX: number, // cm - position of anchor point
  anchorY: number, // cm - position of anchor point
  count: number,
  orientation: 'horizontal' | 'vertical',
  scale: number,
  plateX: number, // pixels - plate position
  plateY: number, // pixels - plate position
  plateWidth: number, // pixels
  plateHeight: number // pixels
): SocketScaled[] {
  const sockets: SocketScaled[] = [];

  const socketSizeCm = SOCKET_SIZE;
  const gapCm = SOCKET_GAP;
  const socketSizePx = socketSizeCm * scale;
  const gapPx = gapCm * scale;

  // Calculate total width/height for the socket group
  let totalWidthCm: number;
  let totalHeightCm: number;

  if (orientation === 'horizontal') {
    // Horizontal: sockets are side by side
    totalWidthCm = count * socketSizeCm + (count - 1) * gapCm;
    totalHeightCm = socketSizeCm;
  } else {
    // Vertical: sockets are stacked
    totalWidthCm = socketSizeCm;
    totalHeightCm = count * socketSizeCm + (count - 1) * gapCm;
  }

  // Calculate starting position (anchor is at center of leftmost socket)
  // Convert anchor position (center of socket) to top-left corner
  const socketLeftEdgeX = anchorX - socketSizeCm / 2; // cm from plate left edge
  const socketBottomEdgeY = anchorY - socketSizeCm / 2; // cm from plate bottom edge

  for (let i = 0; i < count; i++) {
    let socketLeftEdge: number; // cm from plate left edge
    let socketBottomEdge: number; // cm from plate bottom edge

    if (orientation === 'horizontal') {
      socketLeftEdge = socketLeftEdgeX + i * (socketSizeCm + gapCm);
      socketBottomEdge = socketBottomEdgeY;
    } else {
      socketLeftEdge = socketLeftEdgeX;
      socketBottomEdge = socketBottomEdgeY + i * (socketSizeCm + gapCm);
    }

    // Convert to pixels
    // anchorX and anchorY are measured from plate bottom-left
    // Canvas origin is at top-left, so we need to flip Y axis
    const socketXpx = plateX + socketLeftEdge * scale;
    const socketBottomYpx = plateY + plateHeight - socketBottomEdge * scale;
    const socketYpx = socketBottomYpx - socketSizeCm * scale; // Top of socket in pixels

    // Calculate anchor position in pixels (only for the first socket)
    const anchorXPx = plateX + anchorX * scale;
    const anchorYPx = plateY + plateHeight - anchorY * scale;

    sockets.push({
      x: socketXpx,
      y: socketYpx,
      width: socketSizePx,
      height: socketSizePx,
      anchorX,
      anchorY,
      anchorXPx,
      anchorYPx,
      socketIndex: i,
      groupId: '', // Will be set by caller
    });
  }

  return sockets;
}

/**
 * Validation result with error message
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate socket position (check constraints)
 */
export function validateSocketPosition(
  anchorX: number, // cm from plate left edge
  anchorY: number, // cm from plate bottom edge
  count: number,
  orientation: 'horizontal' | 'vertical',
  plateWidth: number, // cm
  plateHeight: number, // cm
  excludeSocketId?: string // Socket ID to exclude from collision check
): ValidationResult {
  const socketSize = SOCKET_SIZE;
  const gap = SOCKET_GAP;
  const minDistanceFromEdge = MIN_DISTANCE_FROM_EDGE;

  // Calculate total dimensions of socket group
  let totalWidth: number;
  let totalHeight: number;

  if (orientation === 'horizontal') {
    totalWidth = count * socketSize + (count - 1) * gap;
    totalHeight = socketSize;
  } else {
    totalWidth = socketSize;
    totalHeight = count * socketSize + (count - 1) * gap;
  }

  // Calculate bounding box
  const startX = anchorX - socketSize / 2; // leftmost/topmost edge
  const startY = anchorY - socketSize / 2; // leftmost/topmost edge
  const endX = startX + totalWidth;
  const endY = startY + totalHeight;

  // Check if socket group is within plate boundaries
  if (startX < minDistanceFromEdge) {
    return {
      isValid: false,
      error: `Distance from left edge must be at least 7 cm`,
    };
  }
  if (startY < minDistanceFromEdge) {
    return {
      isValid: false,
      error: `Distance from bottom edge must be at least 7 cm`,
    };
  }
  if (endX > plateWidth - minDistanceFromEdge) {
    return {
      isValid: false,
      error: `Distance from right edge must be at least 7 cm`,
    };
  }
  if (endY > plateHeight - minDistanceFromEdge) {
    return {
      isValid: false,
      error: `Distance from top edge must be at least 7 cm`,
    };
  }

  return { isValid: true };
}

/**
 * Check if socket groups overlap or are too close
 */
export function checkSocketGroupCollision(
  anchorX: number, // cm
  anchorY: number, // cm
  count: number,
  orientation: 'horizontal' | 'vertical',
  plateWidth: number, // cm
  plateHeight: number, // cm
  existingSockets: Array<{
    id: string;
    anchorX?: number;
    anchorY?: number;
    leftDistance: string;
    bottomDistance: string;
    count: number;
    orientation: 'horizontal' | 'vertical';
    plateIndex: number;
  }>,
  excludeSocketId?: string
): ValidationResult {
  const socketSize = SOCKET_SIZE;
  const gap = SOCKET_GAP;
  const minDistanceBetweenGroups = MIN_DISTANCE_BETWEEN_GROUPS;

  // Calculate bounding box of new socket group
  let newTotalWidth: number;
  let newTotalHeight: number;

  if (orientation === 'horizontal') {
    newTotalWidth = count * socketSize + (count - 1) * gap;
    newTotalHeight = socketSize;
  } else {
    newTotalWidth = socketSize;
    newTotalHeight = count * socketSize + (count - 1) * gap;
  }

  const newStartX = anchorX - socketSize / 2;
  const newStartY = anchorY - socketSize / 2;
  const newEndX = newStartX + newTotalWidth;
  const newEndY = newStartY + newTotalHeight;

  // Check against existing sockets
  for (const existing of existingSockets) {
    if (excludeSocketId && existing.id === excludeSocketId) continue;

    const existingAnchorX =
      existing.anchorX ?? parseFloat(existing.leftDistance) ?? 0;
    const existingAnchorY =
      existing.anchorY ?? parseFloat(existing.bottomDistance) ?? 0;

    let existingTotalWidth: number;
    let existingTotalHeight: number;

    if (existing.orientation === 'horizontal') {
      existingTotalWidth =
        existing.count * socketSize + (existing.count - 1) * gap;
      existingTotalHeight = socketSize;
    } else {
      existingTotalWidth = socketSize;
      existingTotalHeight =
        existing.count * socketSize + (existing.count - 1) * gap;
    }

    const existingStartX = existingAnchorX - socketSize / 2;
    const existingStartY = existingAnchorY - socketSize / 2;
    const existingEndX = existingStartX + existingTotalWidth;
    const existingEndY = existingStartY + existingTotalHeight;

    // Expand bounding boxes by minimum distance
    const padding = minDistanceBetweenGroups;
    const expandedNewStartX = newStartX - padding;
    const expandedNewStartY = newStartY - padding;
    const expandedNewEndX = newEndX + padding;
    const expandedNewEndY = newEndY + padding;

    // Check if expanded boxes overlap
    if (
      expandedNewEndX >= existingStartX &&
      expandedNewStartX <= existingEndX &&
      expandedNewEndY >= existingStartY &&
      expandedNewStartY <= existingEndY
    ) {
      return {
        isValid: false,
        error: `Distance from other socket groups must be at least ${minDistanceBetweenGroups} cm`,
      };
    }
  }

  return { isValid: true };
}

/**
 * Full validation including all constraints
 */
export function validateSocketFull(
  anchorX: number,
  anchorY: number,
  count: number,
  orientation: 'horizontal' | 'vertical',
  plateWidth: number,
  plateHeight: number,
  existingSockets: Array<{
    id: string;
    anchorX?: number;
    anchorY?: number;
    leftDistance: string;
    bottomDistance: string;
    count: number;
    orientation: 'horizontal' | 'vertical';
    plateIndex: number;
  }>,
  excludeSocketId?: string
): ValidationResult {
  // First check basic position constraints
  const positionCheck = validateSocketPosition(
    anchorX,
    anchorY,
    count,
    orientation,
    plateWidth,
    plateHeight,
    excludeSocketId
  );
  if (!positionCheck.isValid) {
    return positionCheck;
  }

  // Then check collision with other socket groups
  const collisionCheck = checkSocketGroupCollision(
    anchorX,
    anchorY,
    count,
    orientation,
    plateWidth,
    plateHeight,
    existingSockets,
    excludeSocketId
  );
  if (!collisionCheck.isValid) {
    return collisionCheck;
  }

  return { isValid: true };
}

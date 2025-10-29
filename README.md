# Plate Socket Generator

Interactive web application for designing electrical socket arrangements on back plates with visual canvas and drag-and-drop functionality.

## Features

- **Multiple plates** with custom dimensions (20–300 cm × 30–128 cm)
- **Socket groups** with 1–5 sockets in horizontal or vertical layouts
- **Drag & drop** positioning with real-time validation
- **Live guides** showing distances from edges with cm measurements
- **Touch support** for mobile devices
- **High DPI canvas** for crisp rendering
- **localStorage persistence** across sessions

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Requirements:** Node.js 18.x+, npm 9.x+

## Architecture

**Key Files:**

- `app/components/PlateCanvas.tsx` - Canvas rendering, drag & drop interactions
- `app/utils/canvas/scaling.ts` - cm→pixels conversion and plate layout calculation
- `app/utils/canvas/drawing.ts` - Socket drawing and validation logic
- `app/components/steps/Step1.tsx` - Plate dimension inputs
- `app/components/steps/Step2.tsx` - Socket configuration
- `app/context/PlateContext.tsx` - Global state management
- `app/hooks/hooks.ts` - localStorage persistence hooks

## Constraints and Rules

### Plate Dimensions

| Dimension | Min | Max | Default | Unit |
| --------- | --- | --- | ------- | ---- |
| Width     | 20  | 300 | 200     | cm   |
| Height    | 30  | 128 | 100     | cm   |

### Socket Specifications

| Property                        | Value               | Description                             |
| ------------------------------- | ------------------- | --------------------------------------- |
| **Socket size**                 | 7×7 cm              | Individual socket dimensions            |
| **Gap between sockets**         | 0.2 cm              | Spacing within a group                  |
| **Minimum edge distance**       | 3 cm                | From socket edge to plate edge          |
| **Distance from edge (center)** | 6.5 cm              | 3 cm + 3.5 cm socket radius             |
| **Group spacing**               | 4 cm                | Minimum between different socket groups |
| **Socket count**                | 1–5                 | Per group                               |
| **Orientation**                 | Horizontal/Vertical | Layout direction                        |

### Minimum Plate Size for Sockets

To place a socket, the plate must be at least **40×40 cm** (allows 7 cm socket + 3 cm margins on all sides).

## Key Behaviors

**Plates:**

- Horizontally arranged, shared scale, dynamically sized
- Click to select, manually configure dimensions
- Sockets cleared when dimensions change

**Socket Dragging:**

- Red dashed guidelines show distance from edges with live cm labels
- Real-time validation blocks invalid positions
- Invalid drops snap-back with error messages
- Blue border indicates active/dragging sockets

**Validation:**

- Blocks placement too close to edges (< 3 cm)
- Prevents overlapping socket groups (< 4 cm spacing)
- Only valid positions are accepted

## Technical Notes

**Mobile:** Full touch support, prevents scroll during drag

**High DPI:** Canvas auto-adjusts for device pixel ratio (Retina-ready)

**Colors:** Blue borders for active plates, red guides for distances, high contrast throughout

## Limitations

- Sockets cannot be dragged between plates (by design)
- Only selected plate displayed in Step 2
- No undo/redo (data persists in localStorage)

## Data Persistence

All data auto-saves to **localStorage**:

- `dimensions` - Plate dimensions array
- `activeIndex` - Selected plate
- `sockets` - Socket configurations
- `cutoutsEnabled`, `socketCount`, `socketOrientation`, etc.

Data persists across page refreshes.

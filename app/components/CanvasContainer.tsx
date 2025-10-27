'use client';

import React from 'react';
import PlateCanvas from './PlateCanvas';

export default function CanvasContainer() {
  return (
    <div className="canvas-container">
      <div className="canvas-content">
        <PlateCanvas />
      </div>
    </div>
  );
}

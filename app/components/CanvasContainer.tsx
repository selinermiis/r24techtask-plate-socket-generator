'use client';

import React from 'react';
import PlateCanvas from './PlateCanvas';

export default function CanvasContainer() {
  return (
    <div className="bg-background border border-border rounded-lg h-full min-h-[400px] md:min-h-[500px] lg:min-h-[600px] max-h-[calc(100vh-7rem)] overflow-hidden">
      <div className="bg-black h-full w-full rounded-lg">
        <PlateCanvas />
      </div>
    </div>
  );
}

'use client';

import React, { useEffect } from 'react';
import { usePlateContext } from '@/app/context/PlateContext';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

interface Step2Props {
  onComplete: () => void;
}

export default function Step2({ onComplete }: Step2Props) {
  const {
    dimensions,
    cutoutsEnabled,
    setCutoutsEnabled,
    selectedPlateForSocket,
    setSelectedPlateForSocket,
  } = usePlateContext();

  const handlePlateSelect = (index: number) => {
    setSelectedPlateForSocket(index);
    // Auto-advance to next step after selection
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  // Auto-advance if cutouts are disabled
  useEffect(() => {
    if (!cutoutsEnabled) {
      const timer = setTimeout(() => {
        onComplete();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [cutoutsEnabled, onComplete]);

  // Don't show content if no dimensions
  if (dimensions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Toggle for cutouts */}
      <div className="bg-muted rounded-lg p-2 sm:p-3 flex items-center justify-between gap-2 sm:gap-3">
        <p className="text-xs sm:text-sm font-medium text-foreground">
          Ausschnitte für Steckdosen angeben?
        </p>
        <Switch
          checked={cutoutsEnabled}
          onCheckedChange={(checked) => {
            setCutoutsEnabled(checked);
            if (!checked) {
              setSelectedPlateForSocket(null);
            }
          }}
          aria-label="Ausschnitte aktivieren/deaktivieren"
        />
      </div>

      {/* Panel selection - only show if cutouts are enabled */}
      {cutoutsEnabled && (
        <div className="space-y-3 sm:space-y-4">
          <p className="text-xs sm:text-sm font-medium text-foreground">
            Wähle die Rückwand für die Steckdose
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {dimensions.map((dim, index) => {
              const isSelected = selectedPlateForSocket === index;

              // Calculate aspect ratio for proper scaling
              const width = parseFloat(dim.width);
              const height = parseFloat(dim.height);
              const aspectRatio = width / height;

              // Set max dimensions for the visual representation
              const maxWidth = 140;
              const maxHeight = 100;

              let visualWidth, visualHeight;
              if (aspectRatio > maxWidth / maxHeight) {
                visualWidth = maxWidth;
                visualHeight = maxWidth / aspectRatio;
              } else {
                visualHeight = maxHeight;
                visualWidth = maxHeight * aspectRatio;
              }

              return (
                <div key={index} className="flex flex-col gap-1 sm:gap-2">
                  <Button
                    onClick={() => handlePlateSelect(index)}
                    variant="outline"
                    className={`relative h-40 sm:h-44 flex items-center justify-center p-0 ${
                      isSelected
                        ? 'border-green-400 bg-green-50'
                        : 'border-border bg-muted hover:border-border'
                    }`}
                  >
                    {/* Visual representation of the plate */}
                    <div
                      className={`border rounded transition-colors ${
                        isSelected
                          ? 'border-green-400 bg-green-100'
                          : 'border-border bg-background'
                      }`}
                      style={{
                        width: `${visualWidth}px`,
                        height: `${visualHeight}px`,
                      }}
                    />
                  </Button>

                  {/* Dimensions text below the card */}
                  <div className="text-center text-xs sm:text-sm font-medium text-muted-foreground">
                    {dim.width} × {dim.height} cm
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

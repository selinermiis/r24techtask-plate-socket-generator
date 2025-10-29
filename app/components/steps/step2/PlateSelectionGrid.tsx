import React from 'react';
import { Button } from '@/components/ui/button';
import type { PlateSelectionGridProps } from '@/app/types';

export default function PlateSelectionGrid({
  dimensions,
  selectedIndex,
  onSelect,
}: PlateSelectionGridProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <p className="text-xs sm:text-sm font-semibold text-foreground">
        Wähle die Rückwand für die Steckdose
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        {dimensions.map((dim, index) => {
          const isSelected = selectedIndex === index;
          const width = parseFloat(dim.width);
          const height = parseFloat(dim.height);
          const isEligible = width >= 40 && height >= 40;

          // Calculate aspect ratio for proper scaling
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
                onClick={() => isEligible && onSelect(index)}
                variant="outline"
                disabled={!isEligible}
                className={`relative h-40 sm:h-44 flex items-center justify-center p-0 ${
                  isSelected
                    ? 'border-green-400 bg-green-50'
                    : !isEligible
                      ? 'border-border bg-muted opacity-40 cursor-not-allowed'
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
              <div
                className={`text-center text-xs sm:text-sm font-medium ${
                  !isEligible
                    ? 'text-muted-foreground opacity-40'
                    : 'text-muted-foreground'
                }`}
              >
                {dim.width} × {dim.height} cm
                {!isEligible && (
                  <div className="text-xs text-red-500 mt-1">
                    Minimum 40×40 cm
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

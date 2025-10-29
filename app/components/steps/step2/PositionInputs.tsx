import React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { PositionInputsProps } from '@/app/types';

export default function PositionInputs({
  distanceLeft,
  distanceBottom,
  onDistanceLeftChange,
  onDistanceBottomChange,
  disabled = false,
}: PositionInputsProps) {
  const handleLeftChange = (value: string) => {
    onDistanceLeftChange(value);
  };

  const handleLeftBlur = () => {
    const numValue = parseFloat(distanceLeft);
    if (!isNaN(numValue)) {
      const formatted = parseFloat(numValue.toFixed(2)).toString();
      onDistanceLeftChange(formatted);
    }
  };

  const handleBottomChange = (value: string) => {
    onDistanceBottomChange(value);
  };

  const handleBottomBlur = () => {
    const numValue = parseFloat(distanceBottom);
    if (!isNaN(numValue)) {
      const formatted = parseFloat(numValue.toFixed(2)).toString();
      onDistanceBottomChange(formatted);
    }
  };

  return (
    <div
      className={cn('space-y-2', disabled && 'opacity-50 pointer-events-none')}
    >
      <p className="text-xs sm:text-sm font-semibold text-foreground">
        Positioniere die Steckdose
      </p>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 sm:gap-2">
        <div className="flex-1 space-y-2">
          <label className="text-xs sm:text-sm font-medium text-foreground block">
            Abstand von Links
          </label>
          <div className="relative">
            <Input
              type="number"
              value={distanceLeft}
              onChange={(e) => !disabled && handleLeftChange(e.target.value)}
              onBlur={handleLeftBlur}
              placeholder="0.0"
              step="0.1"
              min="0"
              disabled={disabled}
              className="h-8 w-full text-base font-semibold text-center pr-8"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
              cm
            </span>
          </div>
        </div>

        <div className="text-foreground text-base font-light pb-2 hidden sm:block">
          ×
        </div>

        <div className="flex-1 space-y-2">
          <label className="text-xs sm:text-sm font-medium text-foreground block">
            Abstand von unten
          </label>
          <div className="relative">
            <Input
              type="number"
              value={distanceBottom}
              onChange={(e) => !disabled && handleBottomChange(e.target.value)}
              onBlur={handleBottomBlur}
              placeholder="0.0"
              step="0.1"
              min="0"
              disabled={disabled}
              className="h-8 w-full text-base font-semibold text-center pr-8"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
              cm
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

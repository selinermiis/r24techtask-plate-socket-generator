import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';

interface SocketConfigurationProps {
  socketCount: number;
  onSocketCountChange: (count: number) => void;
  socketOrientation: 'horizontal' | 'vertical';
  onOrientationChange: (orientation: 'horizontal' | 'vertical') => void;
  disabled?: boolean;
}

export default function SocketConfiguration({
  socketCount,
  onSocketCountChange,
  socketOrientation,
  onOrientationChange,
  disabled = false,
}: SocketConfigurationProps) {
  return (
    <div
      className={cn(
        'space-y-3 sm:space-y-4 pt-2',
        disabled && 'opacity-50 pointer-events-none'
      )}
    >
      <p className="text-xs sm:text-sm font-semibold text-foreground">
        Bestimme Anzahl und Ausrichtung der Steckdosen
      </p>
      <div className="flex flex-col sm:flex-row sm:justify-between gap-4 sm:gap-0">
        {/* Quantity Section */}
        <div className="flex flex-col gap-2">
          <label className="text-xs sm:text-sm font-medium text-foreground">
            Anzahl
          </label>
          <ToggleGroup
            type="single"
            size="sm"
            value={socketCount.toString()}
            onValueChange={(value) =>
              value && !disabled && onSocketCountChange(parseInt(value))
            }
            disabled={disabled}
          >
            {['1', '2', '3', '4', '5'].map((num) => (
              <ToggleGroupItem
                key={num}
                value={num}
                variant="outline"
                className={cn(
                  'bg-background border data-[state=on]:bg-green-100 data-[state=on]:text-green-800 data-[state=on]:border-green-400',
                  num === '1' && 'rounded-l-md rounded-r-none',
                  num === '5' && 'rounded-r-md rounded-l-none',
                  num !== '1' && num !== '5' && 'rounded-none'
                )}
              >
                {num}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {/* Orientation Section */}
        <div className="flex flex-col gap-2">
          <label className="text-xs sm:text-sm font-medium text-foreground">
            Steckdosen-Ausrichtung
          </label>
          <ToggleGroup
            type="single"
            size="sm"
            value={
              socketOrientation === 'horizontal' ? 'Horizontal' : 'Vertikal'
            }
            onValueChange={(value) => {
              if (!disabled) {
                if (value === 'Horizontal') onOrientationChange('horizontal');
                if (value === 'Vertikal') onOrientationChange('vertical');
              }
            }}
            disabled={disabled}
          >
            <ToggleGroupItem
              value="Horizontal"
              variant="outline"
              className="rounded-l-md rounded-r-none bg-background border data-[state=on]:bg-green-100 data-[state=on]:text-green-800 data-[state=on]:border-green-400"
            >
              Horizontal
            </ToggleGroupItem>
            <ToggleGroupItem
              value="Vertikal"
              variant="outline"
              className="rounded-r-md rounded-l-none bg-background border data-[state=on]:bg-green-100 data-[state=on]:text-green-800 data-[state=on]:border-green-400"
            >
              Vertikal
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
    </div>
  );
}

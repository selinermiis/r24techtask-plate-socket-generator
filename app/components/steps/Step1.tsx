'use client';

import React, { useCallback } from 'react';
import {
  DIMENSION_CONSTRAINTS,
  validateAllDimensions,
  canDeletePlate,
  createDefaultDimension,
  cmToMm,
  clampDimensionValue,
  type DimensionValue,
  type DimensionField,
} from '@/app/features/validation';
import { usePlateContext } from '@/app/context/PlateContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Types
interface Step1Props {
  onComplete: () => void;
}

interface DimensionInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  min: number;
  max: number;
  unit?: string;
  isActive?: boolean;
}

// Sub-components
const DimensionInput: React.FC<DimensionInputProps> = ({
  label,
  value,
  onChange,
  onBlur,
  min,
  max,
  unit = 'cm',
  isActive = true,
}) => {
  const mmValue = cmToMm(value).toFixed(0);

  if (!isActive) {
    // Simplified view for inactive cards - just the input (read-only)
    return (
      <div className="flex-1 min-w-0">
        <div className="relative">
          <Input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled
            className="h-8 w-full text-base font-semibold text-center cursor-not-allowed"
            step="0.1"
            min={min}
            max={max}
            aria-label={label}
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium pointer-events-none">
            {unit}
          </span>
        </div>
      </div>
    );
  }

  // Full view for active cards
  return (
    <div className="flex flex-col gap-1 flex-1 min-w-0">
      <div className="flex items-center justify-between">
        <label className="text-xs sm:text-sm font-medium text-foreground truncate">
          {label}
        </label>
        <span className="text-xs text-muted-foreground whitespace-nowrap ml-1">
          {min} - {max} {unit}
        </span>
      </div>
      <div className="relative">
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className="h-8 w-full text-base font-semibold text-center pr-8"
          step="0.1"
          min={min}
          max={max}
          aria-label={label}
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
          {unit}
        </span>
      </div>
      <div className="text-xs text-muted-foreground text-center">
        {mmValue} mm
      </div>
    </div>
  );
};

const RemoveButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <Button
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    variant="destructive"
    size="icon-sm"
    className="w-5 h-5 sm:w-6 sm:h-6 bg-red-100 text-red-500 hover:bg-red-100 active:bg-red-200 rounded-full text-sm"
    aria-label="Rückwand entfernen"
  >
    -
  </Button>
);

const DimensionCard: React.FC<{
  dimensionId: number;
  dimension: DimensionValue;
  onUpdate: (index: number, field: 'width' | 'height', value: string) => void;
  onBlur: (index: number, field: DimensionField) => void;
  onRemove: (index: number) => void;
  showRemoveButton: boolean;
  isActive: boolean;
  onSelect: (index: number) => void;
  index: number;
}> = ({
  dimensionId,
  dimension,
  onUpdate,
  onBlur,
  onRemove,
  showRemoveButton,
  isActive,
  onSelect,
  index,
}) => (
  <Card
    onClick={() => onSelect(index)}
    className={cn(
      'cursor-pointer transition-all rounded-lg p-3 sm:p-4 shadow-none',
      isActive
        ? 'bg-muted  border'
        : 'bg-muted  border opacity-80 hover:opacity-100'
    )}
  >
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Number Badge */}
      <div
        className={cn(
          'w-8 h-8 rounded-md flex items-center justify-center text-sm font-semibold shrink-0',
          isActive
            ? 'bg-black text-white'
            : 'bg-background border border-foreground text-foreground'
        )}
      >
        {dimensionId}
      </div>

      {/* Dimension Inputs */}
      <div
        className="flex-1 flex items-center gap-1.5 min-w-0"
        onClick={(e) => e.stopPropagation()}
      >
        <DimensionInput
          label="Breite"
          value={dimension.width}
          onChange={(value) => onUpdate(index, 'width', value)}
          onBlur={() => onBlur(index, 'width')}
          min={DIMENSION_CONSTRAINTS.width.min}
          max={DIMENSION_CONSTRAINTS.width.max}
          isActive={isActive}
        />

        {/* Multiply Icon */}
        <div
          className={cn(
            'text-foreground text-lg font-light shrink-0',
            isActive && 'self-center'
          )}
        >
          ×
        </div>

        <DimensionInput
          label="Höhe"
          value={dimension.height}
          onChange={(value) => onUpdate(index, 'height', value)}
          onBlur={() => onBlur(index, 'height')}
          min={DIMENSION_CONSTRAINTS.height.min}
          max={DIMENSION_CONSTRAINTS.height.max}
          isActive={isActive}
        />
      </div>

      {/* Remove Button */}
      {showRemoveButton && (
        <div className="shrink-0">
          <RemoveButton onClick={() => onRemove(index)} />
        </div>
      )}
    </div>
  </Card>
);

// Main Component
export default function Step1({ onComplete }: Step1Props) {
  // Use plate context (automatically saves to localStorage)
  const {
    dimensions,
    setDimensions,
    activeIndex,
    setActiveIndex,
    sockets,
    setSockets,
  } = usePlateContext();

  const addDimension = useCallback(() => {
    setDimensions((prev) => {
      const newIndex = prev.length;
      setActiveIndex(newIndex);
      return [...prev, createDefaultDimension()];
    });
  }, []);

  const removeDimension = useCallback(
    (index: number) => {
      setDimensions((prev) => {
        // Use validation module to check if deletion is allowed
        if (!canDeletePlate(prev.length)) {
          return prev;
        }

        const filtered = prev.filter((_, i) => i !== index);

        // If we're removing the active dimension, set the first one as active
        if (index === activeIndex) {
          setActiveIndex(0);
        } else if (index < activeIndex) {
          // If removing an item before active, adjust active index
          setActiveIndex(activeIndex - 1);
        }

        return filtered;
      });

      // Remove sockets belonging to deleted plate and adjust indices
      setSockets((prevSockets) =>
        prevSockets
          .filter((socket) => socket.plateIndex !== index)
          .map((socket) => {
            if (socket.plateIndex > index) {
              return { ...socket, plateIndex: socket.plateIndex - 1 };
            }
            return socket;
          })
      );
    },
    [activeIndex, setSockets]
  );

  const updateDimension = useCallback(
    (index: number, field: 'width' | 'height', value: string) => {
      setDimensions((prev) =>
        prev.map((dim, i) => (i === index ? { ...dim, [field]: value } : dim))
      );
    },
    []
  );

  const handleBlur = useCallback((index: number, field: DimensionField) => {
    setDimensions((prev) => {
      const dimension = prev[index];
      if (!dimension) return prev;

      const currentValue = dimension[field];
      const clamped = clampDimensionValue(currentValue, field);

      // Only update if value was clamped
      if (clamped.wasClamped) {
        return prev.map((dim, i) =>
          i === index ? { ...dim, [field]: clamped.value.toString() } : dim
        );
      }

      return prev;
    });
  }, []);

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Dimension Cards */}
      {dimensions.map((dim, index) => (
        <DimensionCard
          key={index}
          dimensionId={index + 1}
          dimension={dim}
          index={index}
          onUpdate={updateDimension}
          onBlur={handleBlur}
          onRemove={removeDimension}
          showRemoveButton={dimensions.length > 1}
          isActive={index === activeIndex}
          onSelect={setActiveIndex}
        />
      ))}

      {/* Add Back Panel Button */}
      <Button
        onClick={addDimension}
        className="w-full sm:w-auto flex justify-self-end items-center text-green-800 border-green-400 hover:bg-green-100 hover:text-green-800"
        variant="outline"
        aria-label="Rückwand hinzufügen"
      >
        Rückwand hinzufügen <span className="font-semibold">+</span>
      </Button>
    </div>
  );
}

'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import {
  DIMENSION_CONSTRAINTS,
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
            className="h-8 w-full text-sm sm:text-base font-semibold text-center cursor-not-allowed"
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
      <div className="flex items-center justify-between flex-wrap gap-1">
        <label className="text-xs sm:text-sm font-medium text-foreground truncate">
          {label}
        </label>
        <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
          {min} - {max} {unit}
        </span>
      </div>
      <div className="relative">
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className="h-8 w-full sm:w-auto text-sm sm:text-base font-semibold text-center pr-2 sm:pr-8"
          step="0.1"
          min={min}
          max={max}
          aria-label={label}
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
          {unit}
        </span>
      </div>
      <div className="text-[10px] sm:text-xs text-muted-foreground text-center">
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
    <div className="flex items-start sm:items-center gap-2 sm:gap-3">
      {/* Number Badge */}
      <div
        className={cn(
          'w-6 h-6 sm:w-8 sm:h-8 rounded-md flex items-center justify-center text-xs sm:text-sm font-semibold shrink-0 mt-1',
          isActive
            ? 'bg-black text-white'
            : 'bg-background border border-foreground text-foreground'
        )}
      >
        {dimensionId}
      </div>

      {/* Dimension Inputs */}
      <div
        className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-1.5 min-w-0"
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
            'text-foreground text-lg font-light shrink-0 hidden sm:block',
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
        <div className="shrink-0 mt-1">
          <RemoveButton onClick={() => onRemove(index)} />
        </div>
      )}
    </div>
  </Card>
);

// Main Component
export default function Step1() {
  // Use plate context (automatically saves to localStorage)
  const {
    dimensions,
    setDimensions,
    activeIndex,
    setActiveIndex,
    sockets,
    setSockets,
  } = usePlateContext();

  // Track previous dimensions to detect changes
  const prevDimensionsRef = useRef<DimensionValue[]>(dimensions);

  // Remove sockets when plate dimensions change
  useEffect(() => {
    // Skip first render
    if (prevDimensionsRef.current === dimensions) return;

    // Check if any plate dimensions changed
    if (prevDimensionsRef.current.length !== dimensions.length) {
      prevDimensionsRef.current = dimensions;
      return;
    }

    const hasDimensionChanged = prevDimensionsRef.current.some(
      (prevDim, index) => {
        const currentDim = dimensions[index];
        return (
          currentDim &&
          (currentDim.width !== prevDim.width ||
            currentDim.height !== prevDim.height)
        );
      }
    );

    if (hasDimensionChanged) {
      // Find which plate's dimensions changed and remove its sockets
      const changedPlates: number[] = [];
      prevDimensionsRef.current.forEach((prevDim, index) => {
        const currentDim = dimensions[index];
        if (
          currentDim &&
          (currentDim.width !== prevDim.width ||
            currentDim.height !== prevDim.height)
        ) {
          changedPlates.push(index);
        }
      });

      if (changedPlates.length > 0) {
        setSockets((prevSockets) =>
          prevSockets.filter((s) => !changedPlates.includes(s.plateIndex))
        );
      }

      prevDimensionsRef.current = dimensions;
    }
  }, [dimensions, setSockets]);

  const addDimension = useCallback(() => {
    setDimensions((prev) => {
      const newIndex = prev.length;
      setActiveIndex(newIndex);
      return [...prev, createDefaultDimension()];
    });
  }, [setDimensions, setActiveIndex]);

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
    [setDimensions]
  );

  const handleBlur = useCallback(
    (index: number, field: DimensionField) => {
      const dimension = dimensions[index];
      if (!dimension) return;

      const currentValue = dimension[field];
      const clamped = clampDimensionValue(currentValue, field);

      // Only update if value was clamped
      if (clamped.wasClamped) {
        setDimensions((prev) =>
          prev.map((dim, i) =>
            i === index ? { ...dim, [field]: clamped.value.toString() } : dim
          )
        );
      }
    },
    [dimensions, setDimensions]
  );

  return (
    <div className="space-y-3 sm:space-y-4 px-1 sm:px-0">
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
        className="w-full flex justify-center items-center text-green-800 border-green-400 hover:bg-green-100 hover:text-green-800"
        variant="outline"
        aria-label="Rückwand hinzufügen"
      >
        Rückwand hinzufügen <span className="font-semibold">+</span>
      </Button>
    </div>
  );
}

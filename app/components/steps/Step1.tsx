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
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled
            className="h-8 sm:h-9 w-full px-2 sm:px-3 pr-8 sm:pr-12 py-2 text-sm sm:text-base font-semibold text-center border border-gray-100 rounded-lg bg-white text-black cursor-not-allowed"
            step="0.1"
            min={min}
            max={max}
            aria-label={label}
          />
          <span className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-gray-600 font-medium pointer-events-none">
            {unit}
          </span>
        </div>
      </div>
    );
  }

  // Full view for active cards
  return (
    <div className="flex flex-col gap-1 sm:gap-2 flex-1 min-w-0">
      <div className="flex items-center justify-between">
        <label className="text-xs sm:text-sm font-medium text-black truncate">
          {label}
        </label>
        <span className="text-[10px] sm:text-xs text-gray-500 whitespace-nowrap ml-1">
          {min} - {max} {unit}
        </span>
      </div>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className="h-9 sm:h-10 w-full px-2 sm:px-3 pr-8 sm:pr-12 py-2 text-lg sm:text-xl font-semibold text-center border border-gray-300 rounded-lg focus:outline-none bg-white text-black focus:border-transparent transition-shadow"
          step="0.1"
          min={min}
          max={max}
          aria-label={label}
        />
        <span className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-gray-600 font-medium pointer-events-none">
          {unit}
        </span>
      </div>
      <div className="text-[10px] sm:text-xs text-gray-500 text-center">
        {mmValue} mm
      </div>
    </div>
  );
};

const RemoveButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    className="w-5 h-5 sm:w-6 sm:h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center hover:bg-red-100 active:bg-red-200 transition-colors text-lg sm:text-xl leading-none"
    aria-label="Rückwand entfernen"
  >
    -
  </button>
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
  <div
    onClick={() => onSelect(index)}
    className={`rounded-lg border shadow-sm transition-all cursor-pointer ${
      isActive
        ? 'bg-gray-100 border-gray-100 p-2 sm:p-3'
        : 'bg-gray-100 border-gray-100 opacity-80 hover:opacity-100 p-2 sm:p-3'
    }`}
  >
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Number Badge */}
      <div
        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-sm sm:text-base font-semibold shrink-0 ${
          isActive
            ? ' bg-black text-white'
            : ' bg-white border border-black text-black'
        }`}
      >
        {dimensionId}
      </div>

      {/* Dimension Inputs */}
      <div
        className="flex-1 flex items-center gap-1.5 sm:gap-3 min-w-0"
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
          className={`text-gray-400 text-lg sm:text-xl font-light shrink-0 ${isActive ? 'self-center' : ''}`}
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
  </div>
);

// Main Component
export default function Step1({ onComplete }: Step1Props) {
  // Use plate context (automatically saves to localStorage)
  const { dimensions, setDimensions, activeIndex, setActiveIndex } =
    usePlateContext();

  // Validation using the validation module
  const isValid = validateAllDimensions(dimensions);

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
    },
    [activeIndex]
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

  const handleContinue = useCallback(() => {
    if (isValid) {
      onComplete();
    }
  }, [isValid, onComplete]);

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
      <button
        onClick={addDimension}
        className="w-full sm:w-auto px-3 sm:px-4 py-2 border border-green-400 text-green-600 rounded-lg hover:bg-green-50 active:bg-green-100 transition-colors text-sm sm:text-base font-semibold flex items-center justify-center sm:justify-self-end gap-1.5 sm:gap-2"
        aria-label="Rückwand hinzufügen"
      >
        <span>Rückwand hinzufügen</span>{' '}
        <span className="font-semibold text-base sm:text-lg">+</span>
      </button>
    </div>
  );
}

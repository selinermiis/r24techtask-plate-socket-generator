'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Step3Props {
  onComplete: () => void;
}

export default function Step3({ onComplete }: Step3Props) {
  const [socketCount, setSocketCount] = useState('1');
  const [orientation, setOrientation] = useState('Vertikal');
  const [distanceLeft, setDistanceLeft] = useState('42.8');
  const [distanceBottom, setDistanceBottom] = useState('27.5');

  const handleConfirm = () => {
    onComplete();
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* First Card: Determine quantity and orientation */}
      <Card className="p-4 sm:p-5 shadow-none">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-sm sm:text-base font-semibold text-foreground">
            Bestimme Anzahl und Ausrichtung der Steckdosen
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 p-0">
          {/* Quantity Section */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-medium text-foreground">
              Anzahl
            </label>
            <ToggleGroup
              type="single"
              value={socketCount}
              onValueChange={(value) => value && setSocketCount(value)}
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
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-medium text-foreground">
              Steckdosen-Ausrichtung
            </label>
            <ToggleGroup
              type="single"
              value={orientation}
              onValueChange={(value) => value && setOrientation(value)}
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
        </CardContent>
      </Card>

      {/* Second Card: Position the socket */}
      <Card className="p-4 sm:p-5 shadow-none">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-sm sm:text-base font-semibold text-foreground">
            Positioniere die Steckdose
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 p-0">
          {/* Distance Inputs */}
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-2">
              <label className="text-xs sm:text-sm font-medium text-foreground block">
                Abstand von Links
              </label>
              <div className="relative">
                <Input
                  type="number"
                  value={distanceLeft}
                  onChange={(e) => setDistanceLeft(e.target.value)}
                  className="h-8 w-full text-base font-semibold text-center pr-8"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                  cm
                </span>
              </div>
            </div>

            {/* Multiply Icon */}
            <div className="text-foreground text-base font-light pb-2">×</div>

            <div className="flex-1 space-y-2">
              <label className="text-xs sm:text-sm font-medium text-foreground block">
                Abstand von unten
              </label>
              <div className="relative">
                <Input
                  type="number"
                  value={distanceBottom}
                  onChange={(e) => setDistanceBottom(e.target.value)}
                  className="h-8 w-full text-base font-semibold text-center pr-8"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                  cm
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirm Button */}
      <Button
        onClick={handleConfirm}
        className="w-full sm:w-auto flex justify-self-end items-center text-green-800 border-green-400 hover:bg-green-100 hover:text-green-800"
        variant="outline"
      >
        Steckdose bestätigen
      </Button>
    </div>
  );
}

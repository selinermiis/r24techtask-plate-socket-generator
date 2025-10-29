'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlateContext } from '@/app/context/PlateContext';

interface Step3Props {
  onComplete?: () => void;
  onBackToStep2?: () => void;
}

export default function Step3({ onComplete, onBackToStep2 }: Step3Props) {
  const {
    sockets,
    setSockets,
    dimensions,
    setEditingSocketId,
    setSelectedPlateForSocket,
    setSocketCount,
    setSocketOrientation,
    setDistanceLeft,
    setDistanceBottom,
    setCutoutsEnabled,
  } = usePlateContext();

  const handleDeleteSocket = (socketId: string) => {
    setSockets((prev) => prev.filter((socket) => socket.id !== socketId));
  };

  const handleEditSocket = (socket: (typeof sockets)[0]) => {
    setEditingSocketId(socket.id);
    setCutoutsEnabled(true);
    setSelectedPlateForSocket(socket.plateIndex);
    setSocketCount(socket.count);
    setSocketOrientation(socket.orientation);
    setDistanceLeft(socket.leftDistance);
    setDistanceBottom(socket.bottomDistance);

    // Navigate back to Step 2
    if (onBackToStep2) {
      onBackToStep2();
    }
  };

  const handleAddSocket = () => {
    // Reset editing mode
    setEditingSocketId(null);
    setSelectedPlateForSocket(null);
    setSocketCount(1);
    setSocketOrientation('vertical');
    setDistanceLeft('');
    setDistanceBottom('');

    // Navigate back to Step 2 to add new socket
    if (onBackToStep2) {
      onBackToStep2();
    }
  };

  const calculatePrice = (socketCount: number) => {
    return socketCount * 20.0;
  };

  if (sockets.length === 0) {
    return (
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Noch keine Steckdosen hinzugefügt
          </p>
          <Button
            onClick={handleAddSocket}
            className="w-full sm:w-auto flex justify-self-end items-center text-green-800 border-green-400 hover:bg-green-100 hover:text-green-800"
            variant="outline"
          >
            Steckdose hinzufügen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Display sockets */}
      {sockets.map((socket, index) => {
        const plate = dimensions[socket.plateIndex];
        const plateInfo = plate
          ? `${plate.width} x ${plate.height}`
          : 'Unknown Plate';
        const price = calculatePrice(socket.count);

        return (
          <Card
            key={socket.id}
            className="p-2 sm:p-3 flex flex-row items-center  bg-background border-border hover:border-green-300 transition-colors"
          >
            <div className="flex flex-row items-center justify-between flex-1">
              <div className="text-xs font-medium ">
                <span className="text-xs font-semibold ">
                  {index + 1}. Rückwand-
                </span>
                {plateInfo}
                <span className="text-xs font-semibold ">
                  {' '}
                  | {socket.count}x Steckdose
                </span>
                <span className="text-xs font-semibold ">
                  {' '}
                  | L:
                  {socket.anchorX
                    ? socket.anchorX.toFixed(1)
                    : parseFloat(socket.leftDistance).toFixed(1)}
                  cm B:
                  {socket.anchorY
                    ? socket.anchorY.toFixed(1)
                    : parseFloat(socket.bottomDistance).toFixed(1)}
                  cm
                </span>{' '}
                + {price.toFixed(2)} €
              </div>

              {/* Dropdown menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 self-end"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleEditSocket(socket)}
                    className="cursor-pointer"
                  >
                    Bearbeiten
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDeleteSocket(socket.id)}
                    className="text-red-600 cursor-pointer focus:text-red-600"
                  >
                    Löschen
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Card>
        );
      })}

      {/* Add Socket button */}
      <Button
        onClick={handleAddSocket}
        className="w-full sm:w-auto flex justify-self-end items-center text-green-800 border-green-400 hover:bg-green-100 hover:text-green-800"
        variant="outline"
      >
        Steckdose hinzufügen
      </Button>
    </div>
  );
}

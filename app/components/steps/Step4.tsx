'use client';

import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
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

interface Step4Props {
  onComplete?: () => void;
}

interface SocketItem {
  id: number;
  plateDimensions: string;
  socketCount: number;
  price: number;
}

export default function Step4({ onComplete }: Step4Props) {
  const [cutoutsEnabled, setCutoutsEnabled] = useState(false);
  const [sockets, setSockets] = useState<SocketItem[]>([]);

  const handleAddSocket = () => {
    // This will be connected to context later
    setSockets((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        plateDimensions: '151.5 x 36.8',
        socketCount: 1,
        price: 20.0,
      },
    ]);
  };

  const handleDeleteSocket = (id: number) => {
    setSockets((prev) => prev.filter((socket) => socket.id !== id));
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Toggle Switch */}
      <Card className="p-2 sm:p-3 shadow-none">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <p className="text-xs sm:text-sm font-medium text-foreground">
            Ausschnitte für Steckdosen angeben?
          </p>
          <Switch
            checked={cutoutsEnabled}
            onCheckedChange={setCutoutsEnabled}
            aria-label="Ausschnitte aktivieren/deaktivieren"
          />
        </div>
      </Card>

      {/* Socket List Items */}
      {sockets.map((socket) => (
        <Card key={socket.id} className="p-2 sm:p-3 shadow-none">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-medium text-foreground">
                {socket.id}. Rückwand - {socket.plateDimensions} |{' '}
                {socket.socketCount} x Steckdose + {socket.price.toFixed(2)} €
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-muted"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleDeleteSocket(socket.id)}>
                  Löschen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Card>
      ))}

      {/* Add Socket Button */}
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

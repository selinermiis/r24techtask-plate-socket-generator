import React from 'react';
import { Button } from '@/components/ui/button';
import { usePlateContext, type Socket } from '@/app/context/PlateContext';
import { cn } from '@/lib/utils';

interface SocketGroupListProps {
  onSelectGroup: (socket: Socket) => void;
  onDeleteGroup: (socketId: string) => void;
}

export default function SocketGroupList({
  onSelectGroup,
  onDeleteGroup,
}: SocketGroupListProps) {
  const {
    sockets,
    activeSocketId,
    setActiveSocketId,
    dimensions,
    selectedPlateForSocket,
  } = usePlateContext();

  // Filter sockets for the selected plate
  const filteredSockets =
    selectedPlateForSocket !== null
      ? sockets.filter((socket) => socket.plateIndex === selectedPlateForSocket)
      : sockets;

  if (filteredSockets.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="text-xs sm:text-sm font-semibold text-foreground">
        Socket Gruppen ({filteredSockets.length})
      </p>
      <div className="space-y-2">
        {filteredSockets.map((socket, index) => {
          const plate = dimensions[socket.plateIndex];
          const plateInfo = plate
            ? `${parseFloat(plate.width)}×${parseFloat(plate.height)} cm`
            : 'Unknown Plate';
          const isActive = activeSocketId === socket.id;

          return (
            <div
              key={socket.id}
              className={cn(
                'flex items-center justify-between p-2 rounded-lg border transition-colors',
                isActive
                  ? 'bg-green-50 border-green-400'
                  : 'bg-background border-border hover:border-green-300'
              )}
            >
              <div
                className="flex-1 cursor-pointer"
                onClick={() => {
                  setActiveSocketId(socket.id);
                  onSelectGroup(socket);
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isActive
                    ? '#f0fdf4'
                    : '#fafafa';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isActive
                    ? '#f0fdf4'
                    : '';
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Gruppe {index + 1}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    • {socket.count} Stück
                  </span>
                  <span className="text-xs text-muted-foreground">
                    •{' '}
                    {socket.orientation === 'horizontal'
                      ? 'Horizontal'
                      : 'Vertikal'}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {plateInfo} • L:
                  {socket.anchorX
                    ? socket.anchorX.toFixed(1)
                    : parseFloat(socket.leftDistance).toFixed(1)}
                  cm B:
                  {socket.anchorY
                    ? socket.anchorY.toFixed(1)
                    : parseFloat(socket.bottomDistance).toFixed(1)}
                  cm
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteGroup(socket.id);
                }}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                ×
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

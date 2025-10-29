import React from 'react';
import { Switch } from '@/components/ui/switch';

interface SocketToggleProps {
  enabled: boolean;
  onToggle: (checked: boolean) => void;
}

export default function SocketToggle({ enabled, onToggle }: SocketToggleProps) {
  return (
    <div className="bg-muted rounded-lg p-2 sm:p-3 flex items-center justify-between gap-2 sm:gap-3">
      <p className="text-xs sm:text-sm font-medium text-foreground">
        Ausschnitte für Steckdosen angeben?
      </p>
      <Switch
        checked={enabled}
        onCheckedChange={onToggle}
        aria-label="Ausschnitte aktivieren/deaktivieren"
      />
    </div>
  );
}

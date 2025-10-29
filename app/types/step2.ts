export interface SocketToggleProps {
  enabled: boolean;
  onToggle: (checked: boolean) => void;
}

export interface SocketConfigurationProps {
  socketCount: number;
  onSocketCountChange: (count: number) => void;
  socketOrientation: 'horizontal' | 'vertical';
  onOrientationChange: (orientation: 'horizontal' | 'vertical') => void;
  disabled?: boolean;
}

export interface PositionInputsProps {
  distanceLeft: string;
  distanceBottom: string;
  onDistanceLeftChange: (value: string) => void;
  onDistanceBottomChange: (value: string) => void;
  disabled?: boolean;
}

export interface Plate {
  width: string;
  height: string;
}

export interface PlateSelectionGridProps {
  dimensions: Plate[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}

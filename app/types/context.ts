export interface Socket {
  id: string;
  plateIndex: number;
  count: number;
  orientation: 'horizontal' | 'vertical';
  leftDistance: string;
  bottomDistance: string;
  anchorX?: number;
  anchorY?: number;
}

export interface PlateContextType<DimensionValue> {
  dimensions: DimensionValue[];
  setDimensions: React.Dispatch<React.SetStateAction<DimensionValue[]>>;
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
  cutoutsEnabled: boolean;
  setCutoutsEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  selectedPlateForSocket: number | null;
  setSelectedPlateForSocket: React.Dispatch<
    React.SetStateAction<number | null>
  >;
  socketCount: number;
  setSocketCount: React.Dispatch<React.SetStateAction<number>>;
  socketOrientation: 'horizontal' | 'vertical';
  setSocketOrientation: React.Dispatch<
    React.SetStateAction<'horizontal' | 'vertical'>
  >;
  distanceLeft: string;
  setDistanceLeft: React.Dispatch<React.SetStateAction<string>>;
  distanceBottom: string;
  setDistanceBottom: React.Dispatch<React.SetStateAction<string>>;
  sockets: Socket[];
  setSockets: React.Dispatch<React.SetStateAction<Socket[]>>;
  activeSocketId: string | null;
  setActiveSocketId: React.Dispatch<React.SetStateAction<string | null>>;
  editingSocketId: string | null;
  setEditingSocketId: React.Dispatch<React.SetStateAction<string | null>>;
}

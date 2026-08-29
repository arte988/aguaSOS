import type { ReactNode } from "react";
import type { BoundingBox, Punto } from "./tipos";

export type MapaBaseProps = {
  children?: ReactNode;
  ariaLabel?: string;
  center?: Punto;
  initialZoom?: number;
  onViewportChange?: (bbox: BoundingBox) => void;
  onMapClick?: (point: Punto) => void;
  selectedPoint?: Punto | null;
  onMarkerDragEnd?: (point: Punto) => void;
  showMarker?: boolean;
};

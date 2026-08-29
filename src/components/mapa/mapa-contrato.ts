import type { ReactNode } from "react";
import type { BoundingBox, Punto } from "./tipos";

export type MapaBaseProps = {
  children?: ReactNode;
  ariaLabel?: string;
  className?: string;
  center?: Punto;
  initialZoom?: number;
  focusPoint?: Punto | null;
  focusZoom?: number;
  markerDraggable?: boolean;
  bordeRedondeado?: boolean;
  onViewportChange?: (bbox: BoundingBox) => void;
  onMapClick?: (point: Punto) => void;
  selectedPoint?: Punto | null;
  onMarkerDragEnd?: (point: Punto) => void;
  showMarker?: boolean;
};

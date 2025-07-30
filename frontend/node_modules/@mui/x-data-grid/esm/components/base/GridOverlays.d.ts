import * as React from 'react';
import { GridLoadingOverlayVariant } from "../GridLoadingOverlay.js";
import { GridSlotsComponent } from "../../models/index.js";
export type GridOverlayType = keyof Pick<GridSlotsComponent, 'noColumnsOverlay' | 'noRowsOverlay' | 'noResultsOverlay' | 'loadingOverlay'> | null;
interface GridOverlaysProps {
  overlayType: GridOverlayType;
  loadingOverlayVariant: GridLoadingOverlayVariant | null;
}
export declare function GridOverlayWrapper(props: React.PropsWithChildren<GridOverlaysProps>): React.JSX.Element;
export declare namespace GridOverlayWrapper {
  var propTypes: any;
}
export {};
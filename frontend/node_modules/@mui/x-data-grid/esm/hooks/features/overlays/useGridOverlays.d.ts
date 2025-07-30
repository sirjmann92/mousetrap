import * as React from 'react';
import { GridLoadingOverlayVariant } from "../../../components/GridLoadingOverlay.js";
import type { GridOverlayType } from "../../../components/base/GridOverlays.js";
/**
 * Uses the grid state to determine which overlay to display.
 * Returns the active overlay type and the active loading overlay variant.
 */
export declare const useGridOverlays: () => {
  getOverlay: () => React.JSX.Element | null;
  overlaysProps: {
    overlayType: NonNullable<GridOverlayType>;
    loadingOverlayVariant: GridLoadingOverlayVariant | null;
  };
};
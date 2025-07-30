import * as React from 'react';
import { DataGridProcessedProps } from "../../models/props/DataGridProps.js";
import { GridLoadingOverlayVariant } from "../GridLoadingOverlay.js";
import { GridOverlayType } from "../base/GridOverlays.js";
type OwnerState = Pick<DataGridProcessedProps, 'classes'> & {
  hasScrollX: boolean;
  hasPinnedRight: boolean;
  overlayType: GridOverlayType;
  loadingOverlayVariant: GridLoadingOverlayVariant | null;
};
export declare const GridMainContainer: React.ForwardRefExoticComponent<React.PropsWithChildren<{
  className: string;
  ownerState: OwnerState;
}>> | React.ForwardRefExoticComponent<{
  className: string;
  ownerState: OwnerState;
} & {
  children?: React.ReactNode | undefined;
} & React.RefAttributes<HTMLDivElement>>;
export {};
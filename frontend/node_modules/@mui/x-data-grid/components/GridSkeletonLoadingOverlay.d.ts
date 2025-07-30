import * as React from 'react';
import { GridColDef } from "../models/index.js";
type GridSkeletonLoadingOverlayInnerProps = React.HTMLAttributes<HTMLDivElement> & {
  skeletonRowsCount: number;
  showFirstRowBorder?: boolean;
  visibleColumns?: Set<GridColDef['field']>;
};
export declare const GridSkeletonLoadingOverlayInner: React.ForwardRefExoticComponent<GridSkeletonLoadingOverlayInnerProps> | React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & {
  skeletonRowsCount: number;
  showFirstRowBorder?: boolean;
  visibleColumns?: Set<GridColDef["field"]>;
} & React.RefAttributes<HTMLDivElement>>;
export declare const GridSkeletonLoadingOverlay: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement>> | React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export {};
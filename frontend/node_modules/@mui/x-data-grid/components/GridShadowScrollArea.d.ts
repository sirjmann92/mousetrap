import * as React from 'react';
export interface GridShadowScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}
/**
 * Adds scroll shadows above and below content in a scrollable container.
 */
declare const GridShadowScrollArea: React.ForwardRefExoticComponent<GridShadowScrollAreaProps> | React.ForwardRefExoticComponent<GridShadowScrollAreaProps & React.RefAttributes<HTMLDivElement>>;
export { GridShadowScrollArea };
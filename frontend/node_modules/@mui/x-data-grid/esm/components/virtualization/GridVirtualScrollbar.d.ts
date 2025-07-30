import * as React from 'react';
type Position = 'vertical' | 'horizontal';
type GridVirtualScrollbarProps = {
  position: Position;
  scrollPosition: React.RefObject<{
    left: number;
    top: number;
  }>;
};
declare const GridVirtualScrollbar: React.ForwardRefExoticComponent<GridVirtualScrollbarProps> | React.ForwardRefExoticComponent<GridVirtualScrollbarProps & React.RefAttributes<HTMLDivElement>>;
export { GridVirtualScrollbar };
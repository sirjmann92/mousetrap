import * as React from 'react';
import { GridSlotProps } from "../../models/gridSlotsComponent.js";
export interface GridPanelClasses {
  /** Styles applied to the root element. */
  panel: string;
  /** Styles applied to the paper element. */
  paper: string;
}
export interface GridPanelProps extends Pick<GridSlotProps['basePopper'], 'id' | 'className' | 'target' | 'flip'> {
  ref?: React.Ref<HTMLDivElement>;
  children?: React.ReactNode;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<GridPanelClasses>;
  open: boolean;
  onClose?: () => void;
}
export declare const gridPanelClasses: Record<keyof GridPanelClasses, string>;
declare const GridPanel: React.ForwardRefExoticComponent<GridPanelProps> | React.ForwardRefExoticComponent<Omit<GridPanelProps, "ref"> & React.RefAttributes<HTMLDivElement>>;
export { GridPanel };
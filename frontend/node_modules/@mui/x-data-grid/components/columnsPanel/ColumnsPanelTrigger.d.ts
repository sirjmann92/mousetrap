import * as React from 'react';
import { RenderProp } from '@mui/x-internals/useComponentRenderer';
import type { GridSlotProps } from "../../models/index.js";
export interface ColumnsPanelState {
  /**
   * If `true`, the columns panel is open.
   */
  open: boolean;
}
export type ColumnsPanelTriggerProps = Omit<GridSlotProps['baseButton'], 'className'> & {
  /**
   * A function to customize rendering of the component.
   */
  render?: RenderProp<GridSlotProps['baseButton'], ColumnsPanelState>;
  /**
   * Override or extend the styles applied to the component.
   */
  className?: string | ((state: ColumnsPanelState) => string);
};
/**
 * A button that opens and closes the columns panel.
 * It renders the `baseButton` slot.
 *
 * Demos:
 *
 * - [Columns Panel](https://mui.com/x/react-data-grid/components/columns-panel/)
 *
 * API:
 *
 * - [ColumnsPanelTrigger API](https://mui.com/x/api/data-grid/columns-panel-trigger/)
 */
declare const ColumnsPanelTrigger: React.ForwardRefExoticComponent<ColumnsPanelTriggerProps> | React.ForwardRefExoticComponent<Omit<ColumnsPanelTriggerProps, "ref"> & React.RefAttributes<HTMLButtonElement>>;
export { ColumnsPanelTrigger };
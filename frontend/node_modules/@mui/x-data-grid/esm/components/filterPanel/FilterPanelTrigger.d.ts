import * as React from 'react';
import { RenderProp } from '@mui/x-internals/useComponentRenderer';
import type { GridSlotProps } from "../../models/index.js";
export interface FilterPanelState {
  /**
   * If `true`, the filter panel is open.
   */
  open: boolean;
  /**
   * The number of active filters.
   */
  filterCount: number;
}
export type FilterPanelTriggerProps = Omit<GridSlotProps['baseButton'], 'className'> & {
  /**
   * A function to customize rendering of the component.
   */
  render?: RenderProp<GridSlotProps['baseButton'], FilterPanelState>;
  /**
   * A function to customize rendering of the component.
   */
  className?: string | ((state: FilterPanelState) => string);
};
/**
 * A button that opens and closes the filter panel.
 * It renders the `baseButton` slot.
 *
 * Demos:
 *
 * - [Filter Panel](https://mui.com/x/react-data-grid/components/filter-panel/)
 *
 * API:
 *
 * - [FilterPanelTrigger API](https://mui.com/x/api/data-grid/filter-panel-trigger/)
 */
declare const FilterPanelTrigger: React.ForwardRefExoticComponent<FilterPanelTriggerProps> | React.ForwardRefExoticComponent<Omit<FilterPanelTriggerProps, "ref"> & React.RefAttributes<HTMLButtonElement>>;
export { FilterPanelTrigger };
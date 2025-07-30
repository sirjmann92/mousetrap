import * as React from 'react';
import { RenderProp } from '@mui/x-internals/useComponentRenderer';
import type { GridSlotProps } from "../../models/index.js";
import { QuickFilterState } from "./QuickFilterContext.js";
export type QuickFilterClearProps = Omit<GridSlotProps['baseIconButton'], 'className'> & {
  /**
   * A function to customize rendering of the component.
   */
  render?: RenderProp<GridSlotProps['baseIconButton'], QuickFilterState>;
  /**
   * Override or extend the styles applied to the component.
   */
  className?: string | ((state: QuickFilterState) => string);
};
/**
 * A button that resets the filter value.
 * It renders the `baseIconButton` slot.
 *
 * Demos:
 *
 * - [Quick Filter](https://mui.com/x/react-data-grid/components/quick-filter/)
 *
 * API:
 *
 * - [QuickFilterClear API](https://mui.com/x/api/data-grid/quick-filter-clear/)
 */
declare const QuickFilterClear: React.ForwardRefExoticComponent<QuickFilterClearProps> | React.ForwardRefExoticComponent<Omit<QuickFilterClearProps, "ref"> & React.RefAttributes<HTMLButtonElement>>;
export { QuickFilterClear };
import * as React from 'react';
import { RenderProp } from '@mui/x-internals/useComponentRenderer';
import type { GridSlotProps } from "../../models/index.js";
import { QuickFilterState } from "./QuickFilterContext.js";
export type QuickFilterControlProps = Omit<GridSlotProps['baseTextField'], 'className'> & {
  /**
   * A function to customize rendering of the component.
   */
  render?: RenderProp<GridSlotProps['baseTextField'], QuickFilterState>;
  /**
   * Override or extend the styles applied to the component.
   */
  className?: string | ((state: QuickFilterState) => string);
};
/**
 * A component that takes user input and filters row data.
 * It renders the `baseTextField` slot.
 *
 * Demos:
 *
 * - [Quick Filter](https://mui.com/x/react-data-grid/components/quick-filter/)
 *
 * API:
 *
 * - [QuickFilterControl API](https://mui.com/x/api/data-grid/quick-filter-control/)
 */
declare const QuickFilterControl: React.ForwardRefExoticComponent<QuickFilterControlProps> | React.ForwardRefExoticComponent<Omit<QuickFilterControlProps, "ref"> & React.RefAttributes<HTMLInputElement>>;
export { QuickFilterControl };
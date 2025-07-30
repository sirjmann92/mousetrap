import * as React from 'react';
import { RenderProp } from '@mui/x-internals/useComponentRenderer';
import type { GridSlotProps } from "../../models/index.js";
import { QuickFilterState } from "./QuickFilterContext.js";
export type QuickFilterTriggerProps = Omit<GridSlotProps['baseButton'], 'className'> & {
  /**
   * A function to customize rendering of the component.
   */
  render?: RenderProp<GridSlotProps['baseButton'], QuickFilterState>;
  /**
   * Override or extend the styles applied to the component.
   */
  className?: string | ((state: QuickFilterState) => string);
};
/**
 * A button that expands/collapses the quick filter.
 * It renders the `baseButton` slot.
 *
 * Demos:
 *
 * - [Quick Filter](https://mui.com/x/react-data-grid/components/quick-filter/)
 *
 * API:
 *
 * - [QuickFilterTrigger API](https://mui.com/x/api/data-grid/quick-filter-trigger/)
 */
declare const QuickFilterTrigger: React.ForwardRefExoticComponent<QuickFilterTriggerProps> | React.ForwardRefExoticComponent<Omit<QuickFilterTriggerProps, "ref"> & React.RefAttributes<HTMLButtonElement>>;
export { QuickFilterTrigger };
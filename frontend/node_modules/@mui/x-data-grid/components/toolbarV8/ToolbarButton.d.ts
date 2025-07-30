import * as React from 'react';
import { RenderProp } from '@mui/x-internals/useComponentRenderer';
import type { GridSlotProps } from "../../models/index.js";
export type ToolbarButtonProps = GridSlotProps['baseIconButton'] & {
  /**
   * A function to customize rendering of the component.
   */
  render?: RenderProp<GridSlotProps['baseIconButton']>;
};
/**
 * A button for performing actions from the toolbar.
 * It renders the `baseIconButton` slot.
 *
 * Demos:
 *
 * - [Toolbar](https://mui.com/x/react-data-grid/components/toolbar/)
 *
 * API:
 *
 * - [ToolbarButton API](https://mui.com/x/api/data-grid/toolbar-button/)
 */
declare const ToolbarButton: React.ForwardRefExoticComponent<ToolbarButtonProps> | React.ForwardRefExoticComponent<Omit<ToolbarButtonProps, "ref"> & React.RefAttributes<HTMLButtonElement>>;
export { ToolbarButton };
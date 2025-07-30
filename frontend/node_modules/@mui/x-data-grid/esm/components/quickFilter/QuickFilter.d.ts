import * as React from 'react';
import { RenderProp } from '@mui/x-internals/useComponentRenderer';
import { QuickFilterState } from "./QuickFilterContext.js";
import type { GridFilterModel } from "../../models/index.js";
export type QuickFilterProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> & {
  /**
   * Function responsible for parsing text input in an array of independent values for quick filtering.
   * @param {string} input The value entered by the user
   * @returns {any[]} The array of value on which quick filter is applied
   * @default (searchText: string) => searchText.split(' ').filter((word) => word !== '')
   */
  parser?: (input: string) => any[];
  /**
   * Function responsible for formatting values of quick filter in a string when the model is modified
   * @param {any[]} values The new values passed to the quick filter model
   * @returns {string} The string to display in the text field
   * @default (values: string[]) => values.join(' ')
   */
  formatter?: (values: NonNullable<GridFilterModel['quickFilterValues']>) => string;
  /**
   * The debounce time in milliseconds.
   * @default 150
   */
  debounceMs?: number;
  /**
   * The default expanded state of the quick filter control.
   * @default false
   */
  defaultExpanded?: boolean;
  /**
   * The expanded state of the quick filter control.
   */
  expanded?: boolean;
  /**
   * A function to customize rendering of the component.
   */
  render?: RenderProp<React.ComponentProps<'div'>, QuickFilterState>;
  /**
   * Override or extend the styles applied to the component.
   */
  className?: string | ((state: QuickFilterState) => string);
  /**
   * Callback function that is called when the quick filter input is expanded or collapsed.
   * @param {boolean} expanded The new expanded state of the quick filter control
   */
  onExpandedChange?: (expanded: boolean) => void;
};
/**
 * The top level Quick Filter component that provides context to child components.
 * It renders a `<div />` element.
 *
 * Demos:
 *
 * - [Quick Filter](https://mui.com/x/react-data-grid/components/quick-filter/)
 *
 * API:
 *
 * - [QuickFilter API](https://mui.com/x/api/data-grid/quick-filter/)
 */
declare function QuickFilter(props: QuickFilterProps): React.JSX.Element;
declare namespace QuickFilter {
  var propTypes: any;
}
export { QuickFilter };
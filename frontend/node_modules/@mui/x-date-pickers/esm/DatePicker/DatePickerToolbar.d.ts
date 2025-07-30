import * as React from 'react';
import { BaseToolbarProps, ExportedBaseToolbarProps } from "../internals/models/props/toolbar.js";
import { DatePickerToolbarClasses } from "./datePickerToolbarClasses.js";
export interface DatePickerToolbarProps extends BaseToolbarProps, ExportedDatePickerToolbarProps {}
export interface ExportedDatePickerToolbarProps extends ExportedBaseToolbarProps {
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<DatePickerToolbarClasses>;
}
type DatePickerToolbarComponent = ((props: DatePickerToolbarProps & React.RefAttributes<HTMLDivElement>) => React.JSX.Element) & {
  propTypes?: any;
};
/**
 * Demos:
 *
 * - [DatePicker](https://mui.com/x/react-date-pickers/date-picker/)
 * - [Custom components](https://mui.com/x/react-date-pickers/custom-components/)
 *
 * API:
 *
 * - [DatePickerToolbar API](https://mui.com/x/api/date-pickers/date-picker-toolbar/)
 */
export declare const DatePickerToolbar: DatePickerToolbarComponent;
export {};
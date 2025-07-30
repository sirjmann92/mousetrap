import * as React from 'react';
import { BaseToolbarProps, ExportedBaseToolbarProps } from "../internals/models/props/toolbar.js";
import { TimePickerToolbarClasses } from "./timePickerToolbarClasses.js";
export interface TimePickerToolbarProps extends BaseToolbarProps, ExportedTimePickerToolbarProps {
  ampm?: boolean;
  ampmInClock?: boolean;
}
export interface ExportedTimePickerToolbarProps extends ExportedBaseToolbarProps {
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<TimePickerToolbarClasses>;
}
/**
 * Demos:
 *
 * - [TimePicker](https://mui.com/x/react-date-pickers/time-picker/)
 * - [Custom components](https://mui.com/x/react-date-pickers/custom-components/)
 *
 * API:
 *
 * - [TimePickerToolbar API](https://mui.com/x/api/date-pickers/time-picker-toolbar/)
 */
declare function TimePickerToolbar(inProps: TimePickerToolbarProps): React.JSX.Element;
declare namespace TimePickerToolbar {
  var propTypes: any;
}
export { TimePickerToolbar };
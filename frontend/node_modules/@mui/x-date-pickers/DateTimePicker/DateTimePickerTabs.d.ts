import * as React from 'react';
import { DateTimePickerTabsClasses } from "./dateTimePickerTabsClasses.js";
import { ExportedBaseTabsProps } from "../internals/models/props/tabs.js";
export interface DateTimePickerTabsProps extends ExportedBaseTabsProps {
  /**
   * Toggles visibility of the tabs allowing view switching.
   * @default `window.innerHeight < 667` for `DesktopDateTimePicker` and `MobileDateTimePicker`, `displayStaticWrapperAs === 'desktop'` for `StaticDateTimePicker`
   */
  hidden?: boolean;
  /**
   * Date tab icon.
   * @default DateRange
   */
  dateIcon?: React.ReactNode;
  /**
   * Time tab icon.
   * @default Time
   */
  timeIcon?: React.ReactNode;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<DateTimePickerTabsClasses>;
}
/**
 * Demos:
 *
 * - [DateTimePicker](https://mui.com/x/react-date-pickers/date-time-picker/)
 * - [Custom slots and subcomponents](https://mui.com/x/react-date-pickers/custom-components/)
 *
 * API:
 *
 * - [DateTimePickerTabs API](https://mui.com/x/api/date-pickers/date-time-picker-tabs/)
 */
declare const DateTimePickerTabs: {
  (inProps: DateTimePickerTabsProps): React.JSX.Element | null;
  propTypes: any;
};
export { DateTimePickerTabs };
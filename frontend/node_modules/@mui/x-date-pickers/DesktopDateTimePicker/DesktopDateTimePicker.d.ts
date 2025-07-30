import * as React from 'react';
import { DesktopDateTimePickerProps } from "./DesktopDateTimePicker.types.js";
type DesktopDateTimePickerComponent = (<TEnableAccessibleFieldDOMStructure extends boolean = true>(props: DesktopDateTimePickerProps<TEnableAccessibleFieldDOMStructure> & React.RefAttributes<HTMLDivElement>) => React.JSX.Element) & {
  propTypes?: any;
};
/**
 * Demos:
 *
 * - [DateTimePicker](https://mui.com/x/react-date-pickers/date-time-picker/)
 * - [Validation](https://mui.com/x/react-date-pickers/validation/)
 *
 * API:
 *
 * - [DesktopDateTimePicker API](https://mui.com/x/api/date-pickers/desktop-date-time-picker/)
 */
declare const DesktopDateTimePicker: DesktopDateTimePickerComponent;
export { DesktopDateTimePicker };
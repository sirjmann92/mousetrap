import * as React from 'react';
import { TimePickerProps } from "./TimePicker.types.js";
type TimePickerComponent = (<TEnableAccessibleFieldDOMStructure extends boolean = true>(props: TimePickerProps<TEnableAccessibleFieldDOMStructure> & React.RefAttributes<HTMLDivElement>) => React.JSX.Element) & {
  propTypes?: any;
};
/**
 * Demos:
 *
 * - [TimePicker](https://mui.com/x/react-date-pickers/time-picker/)
 * - [Validation](https://mui.com/x/react-date-pickers/validation/)
 *
 * API:
 *
 * - [TimePicker API](https://mui.com/x/api/date-pickers/time-picker/)
 */
declare const TimePicker: TimePickerComponent;
export { TimePicker };
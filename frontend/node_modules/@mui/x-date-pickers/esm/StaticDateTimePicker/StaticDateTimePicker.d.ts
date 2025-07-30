import * as React from 'react';
import { StaticDateTimePickerProps } from "./StaticDateTimePicker.types.js";
type StaticDateTimePickerComponent = ((props: StaticDateTimePickerProps & React.RefAttributes<HTMLDivElement>) => React.JSX.Element) & {
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
 * - [StaticDateTimePicker API](https://mui.com/x/api/date-pickers/static-date-time-picker/)
 */
declare const StaticDateTimePicker: StaticDateTimePickerComponent;
export { StaticDateTimePicker };
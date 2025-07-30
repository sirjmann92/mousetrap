import * as React from 'react';
import { StaticDatePickerProps } from "./StaticDatePicker.types.js";
type StaticDatePickerComponent = ((props: StaticDatePickerProps & React.RefAttributes<HTMLDivElement>) => React.JSX.Element) & {
  propTypes?: any;
};
/**
 * Demos:
 *
 * - [DatePicker](https://mui.com/x/react-date-pickers/date-picker/)
 * - [Validation](https://mui.com/x/react-date-pickers/validation/)
 *
 * API:
 *
 * - [StaticDatePicker API](https://mui.com/x/api/date-pickers/static-date-picker/)
 */
declare const StaticDatePicker: StaticDatePickerComponent;
export { StaticDatePicker };
import * as React from 'react';
import { StaticTimePickerProps } from "./StaticTimePicker.types.js";
type StaticTimePickerComponent = ((props: StaticTimePickerProps & React.RefAttributes<HTMLDivElement>) => React.JSX.Element) & {
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
 * - [StaticTimePicker API](https://mui.com/x/api/date-pickers/static-time-picker/)
 */
declare const StaticTimePicker: StaticTimePickerComponent;
export { StaticTimePicker };
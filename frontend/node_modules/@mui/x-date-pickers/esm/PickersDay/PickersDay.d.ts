import * as React from 'react';
import { PickersDayProps } from "./PickersDay.types.js";
type PickersDayComponent = ((props: PickersDayProps & React.RefAttributes<HTMLButtonElement>) => React.JSX.Element) & {
  propTypes?: any;
};
/**
 * Demos:
 *
 * - [DateCalendar](https://mui.com/x/react-date-pickers/date-calendar/)
 * API:
 *
 * - [PickersDay API](https://mui.com/x/api/date-pickers/pickers-day/)
 */
export declare const PickersDay: PickersDayComponent;
export {};
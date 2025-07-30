import * as React from 'react';
import { DatePickerProps } from "./DatePicker.types.js";
type DatePickerComponent = (<TEnableAccessibleFieldDOMStructure extends boolean = true>(props: DatePickerProps<TEnableAccessibleFieldDOMStructure> & React.RefAttributes<HTMLDivElement>) => React.JSX.Element) & {
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
 * - [DatePicker API](https://mui.com/x/api/date-pickers/date-picker/)
 */
declare const DatePicker: DatePickerComponent;
export { DatePicker };
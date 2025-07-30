import * as React from 'react';
import { TimeFieldProps } from "./TimeField.types.js";
type TimeFieldComponent = (<TEnableAccessibleFieldDOMStructure extends boolean = true>(props: TimeFieldProps<TEnableAccessibleFieldDOMStructure> & React.RefAttributes<HTMLDivElement>) => React.JSX.Element) & {
  propTypes?: any;
};
/**
 * Demos:
 *
 * - [TimeField](http://mui.com/x/react-date-pickers/time-field/)
 * - [Fields](https://mui.com/x/react-date-pickers/fields/)
 *
 * API:
 *
 * - [TimeField API](https://mui.com/x/api/date-pickers/time-field/)
 */
declare const TimeField: TimeFieldComponent;
export { TimeField };
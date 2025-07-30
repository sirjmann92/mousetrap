import * as React from 'react';
import { DateFieldProps } from "./DateField.types.js";
type DateFieldComponent = (<TEnableAccessibleFieldDOMStructure extends boolean = true>(props: DateFieldProps<TEnableAccessibleFieldDOMStructure> & React.RefAttributes<HTMLDivElement>) => React.JSX.Element) & {
  propTypes?: any;
};
/**
 * Demos:
 *
 * - [DateField](http://mui.com/x/react-date-pickers/date-field/)
 * - [Fields](https://mui.com/x/react-date-pickers/fields/)
 *
 * API:
 *
 * - [DateField API](https://mui.com/x/api/date-pickers/date-field/)
 */
declare const DateField: DateFieldComponent;
export { DateField };
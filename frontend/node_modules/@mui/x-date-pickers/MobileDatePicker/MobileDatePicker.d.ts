import * as React from 'react';
import { MobileDatePickerProps } from "./MobileDatePicker.types.js";
type MobileDatePickerComponent = (<TEnableAccessibleFieldDOMStructure extends boolean = true>(props: MobileDatePickerProps<TEnableAccessibleFieldDOMStructure> & React.RefAttributes<HTMLDivElement>) => React.JSX.Element) & {
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
 * - [MobileDatePicker API](https://mui.com/x/api/date-pickers/mobile-date-picker/)
 */
declare const MobileDatePicker: MobileDatePickerComponent;
export { MobileDatePicker };
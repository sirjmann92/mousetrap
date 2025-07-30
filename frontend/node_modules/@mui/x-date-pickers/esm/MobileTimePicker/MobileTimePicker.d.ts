import * as React from 'react';
import { MobileTimePickerProps } from "./MobileTimePicker.types.js";
import { TimeView } from "../models/index.js";
type MobileTimePickerComponent = (<TEnableAccessibleFieldDOMStructure extends boolean = true>(props: MobileTimePickerProps<TimeView, TEnableAccessibleFieldDOMStructure> & React.RefAttributes<HTMLDivElement>) => React.JSX.Element) & {
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
 * - [MobileTimePicker API](https://mui.com/x/api/date-pickers/mobile-time-picker/)
 */
declare const MobileTimePicker: MobileTimePickerComponent;
export { MobileTimePicker };
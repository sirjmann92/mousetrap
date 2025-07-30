import * as React from 'react';
import { PickersLayoutProps } from "../PickersLayout/index.js";
import { PickerValidValue } from "../internals/models/index.js";
type DesktopDateTimePickerLayoutComponent = (<TValue extends PickerValidValue>(props: PickersLayoutProps<TValue> & React.RefAttributes<HTMLDivElement>) => React.JSX.Element) & {
  propTypes?: any;
};
/**
 * @ignore - internal component.
 */
declare const DesktopDateTimePickerLayout: DesktopDateTimePickerLayoutComponent;
export { DesktopDateTimePickerLayout };
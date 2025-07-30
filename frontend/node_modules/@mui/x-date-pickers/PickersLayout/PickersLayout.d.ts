import * as React from 'react';
import { PickerLayoutOwnerState, PickersLayoutProps } from "./PickersLayout.types.js";
import { PickerValidValue } from "../internals/models/index.js";
export declare const PickersLayoutRoot: import("@emotion/styled").StyledComponent<import("@mui/system").MUIStyledCommonProps<import("@mui/material/styles").Theme> & {
  ownerState: PickerLayoutOwnerState;
}, Pick<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, keyof React.HTMLAttributes<HTMLDivElement> | keyof React.ClassAttributes<HTMLDivElement>>, {}>;
export declare const PickersLayoutContentWrapper: import("@emotion/styled").StyledComponent<import("@mui/system").MUIStyledCommonProps<import("@mui/material/styles").Theme> & {
  ownerState: PickerLayoutOwnerState;
}, Pick<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, keyof React.HTMLAttributes<HTMLDivElement> | keyof React.ClassAttributes<HTMLDivElement>>, {}>;
type PickersLayoutComponent = (<TValue extends PickerValidValue>(props: PickersLayoutProps<TValue> & React.RefAttributes<HTMLDivElement>) => React.JSX.Element) & {
  propTypes?: any;
};
/**
 * Demos:
 *
 * - [Custom layout](https://mui.com/x/react-date-pickers/custom-layout/)
 *
 * API:
 *
 * - [PickersLayout API](https://mui.com/x/api/date-pickers/pickers-layout/)
 */
declare const PickersLayout: PickersLayoutComponent;
export { PickersLayout };